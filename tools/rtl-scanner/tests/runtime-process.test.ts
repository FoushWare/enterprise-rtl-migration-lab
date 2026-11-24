import { spawn, type ChildProcess } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { RUNTIME_OUTPUT_LIMIT, captureRuntimeOutput, redactRuntimeOutput, runtimeOutputTail } from '../src/runtime-process.js';

function runNode(script: string): Promise<ChildProcess> {
  const child = spawn(process.execPath, ['-e', script], { stdio: ['ignore', 'pipe', 'pipe'] });
  captureRuntimeOutput(child);
  return new Promise(resolve => child.once('close', () => resolve(child)));
}

describe('runtime output capture', () => {
  it('keeps only the most recent bounded tail of large output', async () => {
    // One stream only: stdout and stderr are separate pipes, and their relative order is not guaranteed on Windows.
    const child = await runNode(`process.stdout.write('head-marker'); process.stdout.write('x'.repeat(${RUNTIME_OUTPUT_LIMIT * 4})); process.stdout.write('tail-marker')`);
    const tail = runtimeOutputTail(child);
    expect(tail.length).toBeLessThanOrEqual(RUNTIME_OUTPUT_LIMIT);
    expect(tail.endsWith('tail-marker')).toBe(true);
    expect(tail).not.toContain('head-marker');
  });

  it('strips ANSI color escapes from captured output', async () => {
    const child = await runNode(`process.stderr.write('\\u001b[31mError: failed\\u001b[0m')`);
    expect(runtimeOutputTail(child)).toBe('Error: failed');
  });

  it('captures the stderr that explains an exit', async () => {
    const child = await runNode(`console.error('sh: vite: command not found'); process.exit(127)`);
    expect(child.exitCode).toBe(127);
    expect(runtimeOutputTail(child)).toContain('sh: vite: command not found');
  });
});

describe('redactRuntimeOutput', () => {
  it('redacts credentials in URLs, bearer tokens and secret-named values', () => {
    const text = [
      'Local: http://user:hunter2@127.0.0.1:4216/',
      'Authorization: Bearer abc.def.ghi',
      'API_KEY=sk-live-123',
      'password: correct-horse',
      'Plain line stays',
    ].join('\n');
    const redacted = redactRuntimeOutput(text, '/Users/tester');
    expect(redacted).not.toContain('hunter2');
    expect(redacted).not.toContain('abc.def.ghi');
    expect(redacted).not.toContain('sk-live-123');
    expect(redacted).not.toContain('correct-horse');
    expect(redacted).toContain('Plain line stays');
    expect(redacted).toContain('[redacted]');
  });

  it('removes environment-style lines and replaces the home directory', () => {
    const redacted = redactRuntimeOutput('NODE_AUTH_TOKEN=abc\nfailed at /Users/tester/project/vite.config.mjs', '/Users/tester');
    expect(redacted).toContain('[environment line removed]');
    expect(redacted).not.toContain('NODE_AUTH_TOKEN');
    expect(redacted).toContain('~/project/vite.config.mjs');
  });

  it('bounds line count, line length and total size', () => {
    const many = Array.from({ length: 500 }, (_, index) => `line ${index} ${'y'.repeat(1000)}`).join('\n');
    const redacted = redactRuntimeOutput(many, '/Users/tester');
    expect(redacted.length).toBeLessThanOrEqual(RUNTIME_OUTPUT_LIMIT);
    expect(redacted.split('\n').every(line => line.length <= 400)).toBe(true);
    expect(redacted).toContain('line 499');
  });
});
