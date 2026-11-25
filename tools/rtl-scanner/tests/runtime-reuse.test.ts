import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writePreviewRuntimeConfig } from '../src/preview-runtime.js';
import { buildRuntimeBridge, installRuntimeState, readRuntimeStateSync, writeRuntimeState } from '../src/preview-runtime-state.js';
import { markCandidateRuntimeStale, type ReviewSession } from '../src/review-session.js';

// Disposable roots only. The composed state changes between writes; the static configuration must not.
async function candidateRoot(): Promise<string> {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'rtl-reuse-')));
  await mkdir(join(root, 'src'), { recursive: true });
  await writeFile(join(root, 'src/app.css'), '.a{margin-left:4px}\n', 'utf8');
  return root;
}

describe('candidate runtime reuse inputs', () => {
  it('keeps the Vite configuration byte-identical across compositions and changes only the state', async () => {
    const root = await candidateRoot();
    try {
      const identity = { role: 'candidate' as const, sessionId: 's1', sourceSha256: 'first' };
      const configPath = await writePreviewRuntimeConfig(root, identity, { application: 'invoicing' });
      const configFirst = await readFile(configPath, 'utf8');
      const stateFirst = readRuntimeStateSync(configPath + '.state.json');
      await writeFile(join(root, 'src/app.css'), '.a{margin-left:8px}\n', 'utf8');
      await writePreviewRuntimeConfig(root, { ...identity, sourceSha256: 'second' }, { application: 'invoicing' });
      expect(await readFile(configPath, 'utf8')).toBe(configFirst);
      const stateSecond = readRuntimeStateSync(configPath + '.state.json');
      expect(stateSecond.identity.sourceSha256).toBe('second');
      expect(JSON.stringify(stateSecond)).not.toBe(JSON.stringify(stateFirst));
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it('builds the page bridge from the current state, so a reused server serves the current identity', () => {
    const before = buildRuntimeBridge({ identity: { sessionId: 's', sourceSha256: 'old' }, sourceHashes: {}, bindings: [], dataAdapter: 'none', readySelector: '#root > *', dashboardOrigin: 'http://127.0.0.1:4320' });
    const after = buildRuntimeBridge({ identity: { sessionId: 's', sourceSha256: 'new' }, sourceHashes: {}, bindings: [], dataAdapter: 'none', readySelector: '#root > *', dashboardOrigin: 'http://127.0.0.1:4320' });
    expect(before).toContain('"sourceSha256":"old"');
    expect(after).toContain('"sourceSha256":"new"');
    expect(after).not.toContain('"sourceSha256":"old"');
  });

  it('writes state atomically and reads it back unchanged', async () => {
    const root = await candidateRoot();
    try {
      const path = join(root, 'state.json');
      const state = { identity: { a: 1 }, sourceHashes: { 'src/app.css': 'h' }, bindings: [], dataAdapter: 'none', readySelector: '#root', dashboardOrigin: 'http://127.0.0.1:4320' };
      await writeRuntimeState(path, state);
      expect(readRuntimeStateSync(path)).toEqual(state);
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it('serves the identity from state and refresh invalidates the module graph only on POST', () => {
    let invalidated = 0;
    const handlers = new Map<string, (request: { method?: string }, response: { statusCode: number; headers: Record<string, string>; setHeader(n: string, v: string): void; end(b?: string): void }) => void>();
    const server = { middlewares: { use: (p: string, h: never) => handlers.set(p, h) }, moduleGraph: { invalidateAll: () => { invalidated++; } } };
    const statePath = join(tmpdir(), 'rtl-reuse-no-such-file.json');
    // Install against a state file written just before the call.
    return writeRuntimeState(statePath, { identity: { sessionId: 'x', sourceSha256: 'y' }, sourceHashes: { 'a.css': 'h' }, bindings: [], dataAdapter: 'none', readySelector: '#root', dashboardOrigin: 'o' })
      .then(async () => {
        installRuntimeState(server as never, statePath);
        const makeResponse = () => { const r = { statusCode: 200, headers: {} as Record<string, string>, body: '', setHeader(n: string, v: string) { r.headers[n] = v; }, end(b?: string) { r.body = b ?? ''; } }; return r; };
        const identity = makeResponse();
        handlers.get('/__rtl_preview_identity')!({}, identity);
        expect(JSON.parse(identity.body)).toMatchObject({ sessionId: 'x', sourceSha256: 'y', contextVersion: 2, sourceHashes: { 'a.css': 'h' } });
        const getRefresh = makeResponse();
        handlers.get('/__rtl_preview_refresh')!({ method: 'GET' }, getRefresh);
        expect(getRefresh.statusCode).toBe(405);
        expect(invalidated).toBe(0);
        const postRefresh = makeResponse();
        handlers.get('/__rtl_preview_refresh')!({ method: 'POST' }, postRefresh);
        expect(JSON.parse(postRefresh.body)).toEqual({ ok: true });
        expect(invalidated).toBe(1);
      })
      .finally(() => rm(statePath, { force: true }));
  });
});

describe('a runtime that no longer serves the current composition is never reported healthy', () => {
  it('marks the session runtime stopped after a composition change', () => {
    const session = { id: 's', root: '/r', candidateRoot: '/c', sourcePath: 'src/app.css', state: 'Candidate Proposed', classification: 'Manual', originalSha256: '', createdAt: '', runtime: { port: 4202, origin: 'http://127.0.0.1:4202', status: 'healthy' as const } } as unknown as ReviewSession;
    const stale = markCandidateRuntimeStale(session);
    expect(stale.runtime?.status).toBe('stopped');
    expect(session.runtime?.status).toBe('healthy');
  });
});
