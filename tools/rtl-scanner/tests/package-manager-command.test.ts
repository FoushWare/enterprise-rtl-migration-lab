import { describe, expect, it } from 'vitest';
import { packageManagerInvocation } from '../src/package-manager-command.js';

// Windows behavior is exercised with injected platform, Node executable, npm_execpath and file-existence inputs, so it
// runs on every platform. Expected Windows paths are literal strings, not computed by the code under test.
// Validation must never use a shell, and arguments must stay separate items.

const onlyExisting = (...paths: string[]) => (path: string) => paths.includes(path);
const win = { platform: 'win32' as const };

describe('POSIX package manager invocation is unchanged', () => {
  it.each(['npm', 'pnpm', 'yarn'] as const)('runs %s by name with the same arguments', name => {
    for (const platform of ['linux', 'darwin'] as const) {
      expect(packageManagerInvocation(name, ['run', 'check'], { platform })).toEqual({ ok: true, invocation: { file: name, args: ['run', 'check'] } });
    }
  });
});

describe('npm CLI resolution on Windows', () => {
  it('uses npm_execpath when npm started this process', () => {
    const npmExecPath = 'C:\\Users\\dev\\AppData\\Roaming\\npm\\node_modules\\npm\\bin\\npm-cli.js';
    const result = packageManagerInvocation('npm', ['run', 'typecheck'], { ...win, nodeExecutable: 'C:\\Program Files\\nodejs\\node.exe', npmExecPath, exists: onlyExisting(npmExecPath, 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js') });
    expect(result).toEqual({ ok: true, invocation: { file: 'C:\\Program Files\\nodejs\\node.exe', args: [npmExecPath, 'run', 'typecheck'] } });
  });

  it('ignores npm_execpath unless it names npm-cli.js', () => {
    const beside = 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js';
    const result = packageManagerInvocation('npm', ['run', 'test'], { ...win, nodeExecutable: 'C:\\Program Files\\nodejs\\node.exe', npmExecPath: 'C:\\tools\\evil.cmd', exists: onlyExisting('C:\\tools\\evil.cmd', beside) });
    expect(result).toEqual({ ok: true, invocation: { file: 'C:\\Program Files\\nodejs\\node.exe', args: [beside, 'run', 'test'] } });
  });

  it.each([
    ['standard Node.js installer', 'C:\\Program Files\\nodejs\\node.exe', 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js'],
    ['nvm-windows (active version link)', 'C:\\nvm4w\\nodejs\\node.exe', 'C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npm-cli.js'],
    ['GitHub Actions tool cache', 'C:\\hostedtoolcache\\windows\\node\\22.21.1\\x64\\node.exe', 'C:\\hostedtoolcache\\windows\\node\\22.21.1\\x64\\node_modules\\npm\\bin\\npm-cli.js'],
  ])('finds npm beside Node for the %s layout', (_label, nodeExecutable, cli) => {
    const result = packageManagerInvocation('npm', ['run', 'check'], { ...win, nodeExecutable, exists: onlyExisting(cli) });
    expect(result).toEqual({ ok: true, invocation: { file: nodeExecutable, args: [cli, 'run', 'check'] } });
  });

  it('fails with an actionable error when npm CLI cannot be found', () => {
    const result = packageManagerInvocation('npm', ['run', 'check'], { ...win, nodeExecutable: 'D:\\portable\\node.exe', exists: () => false });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected a failure');
    expect(result.error).toMatch(/npm CLI entry point was not found/);
    expect(result.error).toMatch(/Install Node\.js with npm/);
  });
});

describe('pnpm and yarn on Windows fail with an explicit error', () => {
  it.each(['pnpm', 'yarn'] as const)('explains that %s is unsupported on Windows and how to proceed', name => {
    const result = packageManagerInvocation(name, ['run', 'test'], { ...win, nodeExecutable: 'C:\\nodejs\\node.exe', exists: () => true });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected a failure');
    expect(result.error).toMatch(new RegExp(`^${name} validation commands are not supported on Windows`));
    expect(result.error).toMatch(/packageManager" to "npm" in rtl-project\.config\.json/);
  });
});

describe('arguments and execution', () => {
  it('keeps arguments as separate items and never runs a shell', () => {
    const args = ['run', 'check', '--', 'a b', '&& echo injected', '"quoted"'];
    const cli = 'C:\\nodejs\\node_modules\\npm\\bin\\npm-cli.js';
    const result = packageManagerInvocation('npm', args, { ...win, nodeExecutable: 'C:\\nodejs\\node.exe', exists: onlyExisting(cli) });
    expect(result).toEqual({ ok: true, invocation: { file: 'C:\\nodejs\\node.exe', args: [cli, ...args] } });
  });
});
