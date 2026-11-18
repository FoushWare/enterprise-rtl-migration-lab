import { describe, it, expect } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runInNewContext } from 'node:vm';
import { writePreviewRuntimeConfig } from '../src/preview-runtime.js';

describe('local preview bridge', () => {
  it('scopes frame permission to the dashboard in a separate development config', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rtl-embed-config-'));
    try {
      const path = await writePreviewRuntimeConfig(root, { role: 'original', sessionId: 'original', sourceSha256: 'source' });
      expect(path).toBe(join(root, '.rtl-preview/vite.config.mts'));
      const config = await readFile(path, 'utf8');
      expect(config).toContain("apply:'serve'");
      expect(config).toContain('frame-ancestors http://127.0.0.1:4320');
      expect(config).not.toContain('frame-ancestors *');
    } finally { await rm(root, { recursive: true, force: true }); }
  });
  it('requires parent origin, source, runtime identity, finding and source hash before reporting real DOM', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rtl-embed-bridge-'));
    try {
      const config = await readFile(await writePreviewRuntimeConfig(root, { role: 'candidate', sessionId: 'owned-session', sourceSha256: 'candidate-hash' }), 'utf8');
      const bridge = JSON.parse(config.match(/children:("(?:[^"\\]|\\.)*"),injectTo/)![1]);
      const messages: unknown[] = []; let listener: (event: unknown) => void = () => undefined;
      const parent = { postMessage: (payload: unknown) => messages.push(payload) };
      const link = { textContent: 'INV-2026-1048', getBoundingClientRect: () => ({ width: 100 }) };
      runInNewContext(bridge, { window: { parent, addEventListener: (_name: string, handler: typeof listener) => { listener = handler; } }, localStorage: { removeItem: () => undefined }, document: { querySelectorAll: (selector: string) => selector === '.invoice-link' ? [link] : [{}], documentElement: { dir: 'rtl' } }, location: { pathname: '/invoices' }, getComputedStyle: () => ({ color: 'rgb(1, 2, 3)' }) });
      const data = { type: 'rtl-preview-probe', version: 1, nonce: 'probe', role: 'candidate', findingId: 'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea', sourcePath: 'apps/invoicing/src/components/InvoiceTable.tsx', expectedSha256: 'candidate-hash', runtimeSessionId: 'owned-session', sessionId: 'owned-session' };
      listener({ origin: 'http://unrelated.invalid', source: parent, data });
      listener({ origin: 'http://127.0.0.1:4320', source: {}, data });
      listener({ origin: 'http://127.0.0.1:4320', source: parent, data: { ...data, runtimeSessionId: 'other-session' } });
      listener({ origin: 'http://127.0.0.1:4320', source: parent, data: { ...data, expectedSha256: 'stale' } });
      listener({ origin: 'http://127.0.0.1:4320', source: parent, data: { ...data, projectRoot: '/wrong-project' } });
      expect(messages).toHaveLength(0);
      listener({ origin: 'http://127.0.0.1:4320', source: parent, data });
      expect(messages).toEqual([expect.objectContaining({ rendered: true, dir: 'rtl', bdiCount: 1, sourceSha256: 'candidate-hash', runtimeSessionId: 'owned-session', invoiceIds: ['INV-2026-1048'] })]);
    } finally { await rm(root, { recursive: true, force: true }); }
  });
});
