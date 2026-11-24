import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The real start, failure and cleanup logic runs. Only the configuration, the config writer and the child-process
// boundary are replaced, so each case controls exactly how the dev server behaves.
vi.mock('../src/preview-configuration.js', async importOriginal => ({
  ...(await importOriginal<typeof import('../src/preview-configuration.js')>()),
  loadPreviewConfiguration: vi.fn(),
}));
vi.mock('../src/preview-runtime.js', async importOriginal => ({
  ...(await importOriginal<typeof import('../src/preview-runtime.js')>()),
  writePreviewRuntimeConfig: vi.fn(async () => '/unused/config.mts'),
}));
vi.mock('../src/runtime-process.js', async importOriginal => ({
  ...(await importOriginal<typeof import('../src/runtime-process.js')>()),
  spawnPreviewRuntime: vi.fn(),
  runtimeOutputTail: vi.fn(() => ''),
}));

import { loadPreviewConfiguration } from '../src/preview-configuration.js';
import { spawnPreviewRuntime, runtimeOutputTail } from '../src/runtime-process.js';
import { OriginalPreviewStartupError, initializeOriginalPreview } from '../src/original-preview-runtime.js';

interface FakeRuntime extends EventEmitter { exitCode: number | null; signalCode: NodeJS.Signals | null; pid?: number }

function fakeRuntime(): FakeRuntime {
  const child = new EventEmitter() as FakeRuntime;
  child.exitCode = null;
  child.signalCode = null;
  return child;
}

let root: string;
let port: number;

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const value = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(value));
    });
  });
}

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'rtl-original-'));
  await mkdir(join(root, 'src'), { recursive: true });
  await writeFile(join(root, 'src', 'app.js'), 'export {};');
  port = await freePort();
  vi.mocked(loadPreviewConfiguration).mockResolvedValue({
    schemaVersion: 1,
    digest: 'digest',
    mappings: [],
    applications: {
      foundations: {
        viteConfig: 'vite.config.mjs',
        entry: 'src/app.js',
        originalOrigin: `http://127.0.0.1:${port}`,
        readySelector: '#overview',
        dataAdapter: 'none',
        startupScript: 'dev',
        routes: [{ id: 'home', path: '/', ltr: '/?direction=ltr', rtl: '/?direction=rtl' }],
      },
    },
  } as never);
  vi.mocked(runtimeOutputTail).mockReturnValue('');
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('original preview startup failures', () => {
  it('reports an exited dev server with its exit code and redacted output, and stops nothing it does not own', async () => {
    const child = fakeRuntime();
    vi.mocked(spawnPreviewRuntime).mockImplementation(async () => {
      queueMicrotask(() => { child.exitCode = 127; child.emit('exit', 127, null); });
      return child as never;
    });
    vi.mocked(runtimeOutputTail).mockReturnValue('sh: vite: command not found\nAPI_TOKEN=abc123\nurl http://me:secret@127.0.0.1/');

    const failure = await initializeOriginalPreview(root, 'foundations').catch(error => error);
    expect(failure).toBeInstanceOf(OriginalPreviewStartupError);
    expect(failure.code).toBe('ORIGINAL_PREVIEW_STARTUP_FAILED');
    expect(failure.message).toBe('ORIGINAL_PREVIEW_STARTUP_FAILED');
    expect(failure.diagnostics).toMatchObject({ reason: 'exited', exitCode: 127, startupScript: 'dev', cwd: root, port });
    expect(failure.diagnostics.output).toContain('sh: vite: command not found');
    expect(failure.diagnostics.output).not.toContain('abc123');
    expect(failure.diagnostics.output).not.toContain('secret');
  });

  it('reports a spawn error with its code instead of a generic failure', async () => {
    vi.mocked(spawnPreviewRuntime).mockImplementation(async () => {
      const child = fakeRuntime();
      // Node reports spawn failures asynchronously, after the caller has attached its listener.
      setTimeout(() => child.emit('error', Object.assign(new Error('spawn npm ENOENT'), { code: 'ENOENT' })), 5);
      return child as never;
    });
    const failure = await initializeOriginalPreview(root, 'foundations').catch(error => error);
    expect(failure.diagnostics).toMatchObject({ reason: 'spawn-error', spawnErrorCode: 'ENOENT' });
  });

  it('starts a fresh runtime on retry after a failed attempt, so nothing is reused or orphaned', async () => {
    vi.mocked(spawnPreviewRuntime).mockImplementation(async () => {
      const child = fakeRuntime();
      queueMicrotask(() => { child.exitCode = 1; child.emit('exit', 1, null); });
      return child as never;
    });
    await initializeOriginalPreview(root, 'foundations').catch(() => undefined);
    await initializeOriginalPreview(root, 'foundations').catch(() => undefined);
    expect(spawnPreviewRuntime).toHaveBeenCalledTimes(2);
  });
});
