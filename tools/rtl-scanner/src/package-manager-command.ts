import { existsSync } from 'node:fs';
import { win32 } from 'node:path';

export type PackageManagerName = 'npm' | 'pnpm' | 'yarn';
export interface PackageManagerInvocation { readonly file: string; readonly args: readonly string[] }
export type PackageManagerResolution =
  | { readonly ok: true; readonly invocation: PackageManagerInvocation }
  | { readonly ok: false; readonly error: string };

export interface PackageManagerEnvironment {
  readonly platform?: NodeJS.Platform;
  /** The running Node executable (process.execPath by default). */
  readonly nodeExecutable?: string;
  /** npm sets this to its own CLI path when it runs a script (npm_execpath by default). */
  readonly npmExecPath?: string;
  readonly exists?: (path: string) => boolean;
}

/**
 * Builds the executable and arguments that run a project validation script. No shell is used: the file is either the
 * package manager on POSIX or the running Node executable on Windows, and arguments are always separate items.
 *
 * On Windows, npm is a `.cmd` shim that execFile cannot start, so npm's CLI entry point is run with Node. The entry point
 * is taken from npm's own `npm_execpath` when npm started this process; otherwise it is the `node_modules/npm` directory
 * beside the Node executable (standard installer, nvm-windows and the GitHub Actions tool cache all use this layout).
 * When neither exists the result is an explicit error. pnpm and yarn have no verified Windows entry point, so they fail
 * with an explicit error. POSIX invocations are unchanged.
 */
export function packageManagerInvocation(name: PackageManagerName, args: readonly string[], env: PackageManagerEnvironment = {}): PackageManagerResolution {
  const platform = env.platform ?? process.platform;
  if (platform !== 'win32') return { ok: true, invocation: { file: name, args: [...args] } };
  if (name !== 'npm') {
    return { ok: false, error: `${name} validation commands are not supported on Windows in this release. Set "packageManager" to "npm" in rtl-project.config.json, or run validation on macOS or Linux.` };
  }
  const nodeExecutable = env.nodeExecutable ?? process.execPath;
  const cli = npmCliEntryPoint(nodeExecutable, env.npmExecPath ?? process.env.npm_execpath, env.exists ?? existsSync);
  if (!cli) {
    return { ok: false, error: 'The npm CLI entry point was not found beside the Node.js executable. Install Node.js with npm (the official installer or nvm-windows), or run validation on macOS or Linux.' };
  }
  return { ok: true, invocation: { file: nodeExecutable, args: [cli, ...args] } };
}

// Windows path rules are applied explicitly, so the same entry point is chosen whichever host runs the check.
function npmCliEntryPoint(nodeExecutable: string, npmExecPath: string | undefined, exists: (path: string) => boolean): string | undefined {
  if (npmExecPath && win32.basename(npmExecPath).toLowerCase() === 'npm-cli.js' && exists(npmExecPath)) return npmExecPath;
  const beside = win32.join(win32.dirname(nodeExecutable), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  return exists(beside) ? beside : undefined;
}
