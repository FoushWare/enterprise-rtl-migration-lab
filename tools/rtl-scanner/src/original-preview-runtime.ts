import { type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { loadPreviewConfiguration } from './preview-configuration.js';
import { writePreviewRuntimeConfig } from './preview-runtime.js';
import { ORIGINAL_PREVIEW_ORIGINS } from './contextual-preview.js';

import {spawnPreviewRuntime,signalOwnedRuntime} from './runtime-process.js';

const starts = new Map<string, Promise<void>>();
const children = new Map<string, ChildProcess>();
/** Only call after authoritative report/mapping checks. No candidate is created or patched. */
export async function initializeOriginalPreview(root: string, application: string) {
  const key = root + '|' + application;
  const pending = starts.get(key);
  if (pending) return pending;
  const operation = start(); starts.set(key, operation);
  try { await operation; } finally { starts.delete(key); }
  async function start() {
    const configuration = await loadPreviewConfiguration(root), app = configuration.applications[application];
    const origin = app?.originalOrigin ?? ORIGINAL_PREVIEW_ORIGINS[application];
    if (!origin) throw Error('ORIGINAL_APPLICATION_NOT_CONFIGURED');
    const url = new URL(origin);
    if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1') throw Error('UNAPPROVED_PREVIEW_ORIGIN');
    // Never stop or adopt a process by port. A running owned Vite observes wrapper updates.
    const owned = children.get(key);
    if (!owned || owned.exitCode !== null || owned.signalCode !== null) {
      await new Promise<void>((resolve, reject) => {
        const probe = createServer(); probe.once('error', () => reject(Error('ORIGINAL_PREVIEW_PORT_OCCUPIED')));
        probe.listen(Number(url.port), '127.0.0.1', () => probe.close(() => resolve()));
      });
    }
    const source = app?.entry ?? (application === 'invoicing' ? 'apps/invoicing/src/components/InvoiceTable.tsx' : 'apps/procurement/src/App.tsx');
    const sourceSha256 = createHash('sha256').update(await readFile(join(root, source))).digest('hex');
    const config = await writePreviewRuntimeConfig(root, { role: 'original', sessionId: 'original', sourceSha256 }, { application });
    if (!owned || owned.exitCode !== null || owned.signalCode !== null) {
      const child = await spawnPreviewRuntime(root,application,config,Number(url.port));
      children.set(key, child); child.on('error', () => {});
    }
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        const actual = await fetch(origin + '/__rtl_preview_identity', { signal: AbortSignal.timeout(500) }).then(r => r.json()) as { projectRoot: string; role: string; application: string; sourceSha256: string };
        if (actual.projectRoot === root && actual.role === 'original' && actual.application === application && actual.sourceSha256 === sourceSha256) return;
      } catch { /* Wait only for this initialization; descriptors verify the complete identity next. */ }
      if (children.get(key)?.exitCode !== null || children.get(key)?.signalCode !== null) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw Error('ORIGINAL_PREVIEW_STARTUP_FAILED');
  }
}

export function stopOwnedOriginalPreviews() {
  for (const child of children.values()) if (child.exitCode === null) signalOwnedRuntime(child);
}
