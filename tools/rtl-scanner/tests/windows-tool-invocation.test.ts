import { describe, expect, it } from 'vitest';
import { binaryInvocation, toolInvocation } from '../../../tests/e2e/tool-invocation.mjs';

// The packaged smoke test runs npm and npx through this helper. Windows behavior is exercised with injected inputs, so it
// runs on every platform. Expected Windows paths are literal strings. No shell is used and arguments stay separate.

const nodeExe = 'C:\\Program Files\\nodejs\\node.exe';
const beside = 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin';
const onlyExisting = (...paths: string[]) => (path: string) => paths.includes(path);

describe('smoke test tool invocation', () => {
  it.each(['npm', 'npx'])('keeps POSIX invocation of %s unchanged', name => {
    expect(toolInvocation(name, ['install', '--save-dev'], { platform: 'linux' })).toEqual({ file: name, args: ['install', '--save-dev'] });
    expect(toolInvocation(name, ['run', 'x'], { platform: 'darwin' })).toEqual({ file: name, args: ['run', 'x'] });
  });

  it('runs npm through the running Node executable on Windows, from npm_execpath when set', () => {
    const npmExecPath = 'C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npm-cli.js';
    const result = toolInvocation('npm', ['install', '--ignore-scripts'], { platform: 'win32', nodeExecutable: nodeExe, npmExecPath, exists: onlyExisting('C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npm-cli.js') });
    expect(result).toEqual({ file: nodeExe, args: ['C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npm-cli.js', 'install', '--ignore-scripts'] });
  });

  it('runs npx through npx-cli.js beside npm on Windows', () => {
    const result = toolInvocation('npx', ['--no-install', 'rtl-analyzer', '--help'], { platform: 'win32', nodeExecutable: nodeExe, npmExecPath: 'C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npm-cli.js', exists: onlyExisting('C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npx-cli.js') });
    expect(result).toEqual({ file: nodeExe, args: ['C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npx-cli.js', '--no-install', 'rtl-analyzer', '--help'] });
  });

  it('falls back to the npm directory beside Node when npm_execpath is absent', () => {
    expect(toolInvocation('npm', ['ls'], { platform: 'win32', nodeExecutable: nodeExe, npmExecPath: '', exists: onlyExisting(`${beside}\\npm-cli.js`) })).toEqual({ file: nodeExe, args: [`${beside}\\npm-cli.js`, 'ls'] });
    expect(toolInvocation('npx', ['--version'], { platform: 'win32', nodeExecutable: nodeExe, npmExecPath: '', exists: onlyExisting(`${beside}\\npx-cli.js`) })).toEqual({ file: nodeExe, args: [`${beside}\\npx-cli.js`, '--version'] });
  });

  it('ignores npm_execpath that does not name npm-cli.js', () => {
    const result = toolInvocation('npm', ['ls'], { platform: 'win32', nodeExecutable: nodeExe, npmExecPath: 'C:\\tools\\evil.cmd', exists: onlyExisting(`${beside}\\npm-cli.js`) });
    expect(result.args[0]).toBe(`${beside}\\npm-cli.js`);
  });

  it('fails with an actionable error when the npm CLI cannot be found on Windows', () => {
    expect(() => toolInvocation('npm', ['ls'], { platform: 'win32', nodeExecutable: 'D:\\portable\\node.exe', npmExecPath: '', exists: () => false })).toThrow(/Cannot find npm-cli\.js for npm.*Node\.js installation that includes npm/);
  });

  it('refuses to invent a Windows entry point for other commands', () => {
    expect(() => toolInvocation('python3', ['-m', 'http.server'], { platform: 'win32', nodeExecutable: nodeExe, exists: () => true })).toThrow(/No Windows CLI entry point is defined for "python3"/);
  });

  it('keeps arguments as separate items, including shell metacharacters', () => {
    const args = ['--no-install', 'playwright', 'install', 'chromium', '&& echo injected', '"quoted"'];
    const cli = `${beside}\\npx-cli.js`;
    expect(toolInvocation('npx', args, { platform: 'win32', nodeExecutable: nodeExe, npmExecPath: '', exists: onlyExisting(cli) })).toEqual({ file: nodeExe, args: [cli, ...args] });
  });
});

describe('smoke test package binary invocation', () => {
  const projectDir = 'C:\\smoke\\project';
  const packageDir = 'C:\\smoke\\project\\node_modules\\rtl-analyzer';
  const metadata = (bin: Record<string, string>) => () => JSON.stringify({ name: 'rtl-analyzer', bin });

  it('keeps the node_modules/.bin link on POSIX', () => {
    expect(binaryInvocation('/smoke/project', 'rtl-analyzer', 'rtl-preview', ['--flag'], { platform: 'linux' })).toEqual({ file: '/smoke/project/node_modules/.bin/rtl-preview', args: ['--flag'] });
  });

  it('runs the bin entry declared by the package through Node on Windows', () => {
    const entry = `${packageDir}\\dist\\preview-cli.js`;
    const result = binaryInvocation(projectDir, 'rtl-analyzer', 'rtl-preview', ['--port', '4320'], { platform: 'win32', nodeExecutable: nodeExe, readText: metadata({ 'rtl-preview': 'dist/preview-cli.js' }), exists: onlyExisting(entry) });
    expect(result).toEqual({ file: nodeExe, args: [entry, '--port', '4320'] });
  });

  it('does not assume the entry filename or location: it follows the declared bin path', () => {
    const entry = `${packageDir}\\bin\\launch-preview.mjs`;
    const result = binaryInvocation(projectDir, 'rtl-analyzer', 'rtl-preview', ['x'], { platform: 'win32', nodeExecutable: nodeExe, readText: metadata({ 'rtl-preview': 'bin/launch-preview.mjs' }), exists: onlyExisting(entry) });
    expect(result).toEqual({ file: nodeExe, args: [entry, 'x'] });
  });

  it('fails with an explicit error when the package declares no such bin', () => {
    expect(() => binaryInvocation(projectDir, 'rtl-analyzer', 'rtl-preview', [], { platform: 'win32', nodeExecutable: nodeExe, readText: metadata({ 'rtl-analyzer': 'dist/standalone-cli.js' }), exists: () => true })).toThrow(/declares no "rtl-preview" bin entry/);
  });

  it('fails with an explicit error when the declared entry is missing', () => {
    expect(() => binaryInvocation(projectDir, 'rtl-analyzer', 'rtl-preview', [], { platform: 'win32', nodeExecutable: nodeExe, readText: metadata({ 'rtl-preview': 'dist/preview-cli.js' }), exists: () => false })).toThrow(/does not exist/);
  });
});
