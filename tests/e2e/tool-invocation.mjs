// Resolves npm and npx to a file that spawnSync can start without a shell.
// On Windows both are `.cmd` shims, and spawnSync cannot start a shim (it reports status null and an error). Their CLI entry
// points are run through the running Node executable instead. Arguments stay separate items; nothing is interpolated.
import { existsSync, readFileSync } from 'node:fs';
import { posix, win32 } from 'node:path';

const entries = { npm: 'npm-cli.js', npx: 'npx-cli.js' };

export function toolInvocation(name, args, {
  platform = process.platform,
  nodeExecutable = process.execPath,
  npmExecPath = process.env.npm_execpath,
  exists = existsSync,
} = {}) {
  if (platform !== 'win32') return { file: name, args: [...args] };
  const entry = entries[name];
  if (!entry) throw new Error(`No Windows CLI entry point is defined for "${name}".`);
  const paths = win32;
  // npm sets npm_execpath to its own CLI when it started this process; npx-cli.js sits in the same bin directory.
  const fromNpm = npmExecPath && paths.basename(npmExecPath).toLowerCase() === 'npm-cli.js' ? paths.dirname(npmExecPath) : undefined;
  const beside = paths.join(paths.dirname(nodeExecutable), 'node_modules', 'npm', 'bin');
  const binDirectory = fromNpm ?? beside;
  const cli = paths.join(binDirectory, entry);
  if (!exists(cli)) throw new Error(`Cannot find ${entry} for ${name} (looked in ${binDirectory}). Run the smoke test with a Node.js installation that includes npm.`);
  return { file: nodeExecutable, args: [cli, ...args] };
}

// Launches an installed package binary. POSIX keeps the node_modules/.bin link unchanged. On Windows the `.bin` entry is a
// `.cmd` shim that spawn cannot start, so the entry point is read from the package's own "bin" metadata and run through Node.
export function binaryInvocation(projectDirectory, packageName, binName, args, {
  platform = process.platform,
  nodeExecutable = process.execPath,
  readText = (path) => readFileSync(path, 'utf8'),
  exists = existsSync,
} = {}) {
  // The POSIX link path is built with POSIX rules, so the result depends only on the requested platform, not on the host.
  if (platform !== 'win32') return { file: posix.join(projectDirectory, 'node_modules', '.bin', binName), args: [...args] };
  const packageDirectory = win32.join(projectDirectory, 'node_modules', packageName);
  const metadata = JSON.parse(readText(win32.join(packageDirectory, 'package.json')));
  const relative = metadata.bin?.[binName];
  if (typeof relative !== 'string' || relative === '') throw new Error(`Package ${packageName} declares no "${binName}" bin entry.`);
  const entry = win32.join(packageDirectory, relative);
  if (!exists(entry)) throw new Error(`The "${binName}" entry point ${entry} from ${packageName} does not exist.`);
  return { file: nodeExecutable, args: [entry, ...args] };
}
