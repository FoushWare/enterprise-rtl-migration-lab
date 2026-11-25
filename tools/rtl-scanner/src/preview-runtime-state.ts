import { mkdir, rename, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
import { contextualBridgeSource } from './contextual-preview-bridge.js';

/**
 * The per-composition state of a candidate runtime. The Vite configuration is static for a session and application;
 * everything that changes when the composed file changes lives here, and the running server reads it on every request.
 * This is what lets a healthy runtime be reused without restarting Vite.
 */
export interface RuntimeStateDocument {
  identity: Record<string, unknown>;
  sourceHashes: Record<string, string>;
  bindings: unknown[];
  dataAdapter: string;
  readySelector: string;
  dashboardOrigin: string;
}

const scriptJson = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');

/** Builds the page bridge for one state. Called per page request, so a reused server serves the current composition. */
export function buildRuntimeBridge(state: RuntimeStateDocument): string {
  const runtimeIdentity = state.identity;
  const sourceHashes = state.sourceHashes;
  const bindings = state.bindings;
  const dataAdapter = state.dataAdapter;
  const readySelector = state.readySelector;
  const DASHBOARD_ORIGIN = state.dashboardOrigin;
  return `(()=>{
    const identity=${scriptJson(runtimeIdentity)},dashboardOrigin=${scriptJson(DASHBOARD_ORIGIN)};
    window.addEventListener('message',event=>{
      const request=event.data;
      if(event.origin!==dashboardOrigin||event.source!==window.parent||!request||request.type!=='rtl-preview-probe'||request.version!==1||typeof request.nonce!=='string'||request.nonce.length>100||request.role!==identity.role||typeof request.findingId!=='string'||!/^RTL\\.BIDI\\.ISOLATION:[a-f0-9]{24,64}$/.test(request.findingId)||request.sourcePath!=='apps/invoicing/src/components/InvoiceTable.tsx'||request.expectedSha256!==identity.sourceSha256||request.runtimeSessionId!==identity.sessionId||typeof request.sessionId!=='string')return;
      if(request.projectRoot!==undefined&&request.projectRoot!==identity.projectRoot)return;
      const links=[...document.querySelectorAll('.invoice-link')];
      const invoiceIds=links.map(link=>link.textContent.trim());
      const bdiCount=document.querySelectorAll('.invoice-link bdi[dir="auto"]').length;
      const rendered=location.pathname==='/invoices'&&links.length>0&&links.every(link=>link.getBoundingClientRect().width>0)&&getComputedStyle(links[0]).color!=='rgb(0, 0, 0)';
      window.parent.postMessage({type:'rtl-preview-status',version:1,nonce:request.nonce,role:identity.role,sessionId:request.sessionId,runtimeSessionId:identity.sessionId,projectRoot:identity.projectRoot,findingId:request.findingId,sourcePath:request.sourcePath,sourceSha256:identity.sourceSha256,rendered,dir:document.documentElement.dir,route:location.pathname,invoiceIds,bdiCount,fixtureData:'atlas-seed-v1'},dashboardOrigin);
    });
  })();` + contextualBridgeSource + '\ninstallContextPreview(' + scriptJson({identity:runtimeIdentity,dashboardOrigin:DASHBOARD_ORIGIN,sourceHashes,bindings,dataAdapter,readySelector:readySelector}) + ');';
}

/** Writes the state atomically: a reader never sees a partly written document. */
export async function writeRuntimeState(path: string, state: RuntimeStateDocument): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(state), { encoding: 'utf8', flag: 'wx' });
  await rename(temporary, path);
}

export function readRuntimeStateSync(path: string): RuntimeStateDocument {
  return JSON.parse(readFileSync(path, 'utf8')) as RuntimeStateDocument;
}

/** Vite plugin hook: the bridge is built from the state file for each HTML response. */
export function runtimeStateTags(path: string): { tag: 'script'; children: string; injectTo: 'head-prepend' }[] {
  return [{ tag: 'script', children: buildRuntimeBridge(readRuntimeStateSync(path)), injectTo: 'head-prepend' }];
}

/**
 * Vite plugin hook: the identity endpoint reflects the current state, and the refresh endpoint drops Vite's cached module
 * graph so the next request transforms the files on disk again. Refresh is POST-only and served on the loopback origin.
 */
export function installRuntimeState(server: { middlewares: { use(path: string, handler: (request: { method?: string }, response: { setHeader(name: string, value: string): void; end(body?: string): void; statusCode: number }) => void): void }; moduleGraph: { invalidateAll(): void } }, path: string): void {
  server.middlewares.use('/__rtl_preview_identity', (_request, response) => {
    const state = readRuntimeStateSync(path);
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Cache-Control', 'no-store');
    response.end(JSON.stringify({ ...state.identity, contextVersion: 2, sourceHashes: state.sourceHashes }));
  });
  server.middlewares.use('/__rtl_preview_refresh', (request, response) => {
    if (request.method !== 'POST') { response.statusCode = 405; response.end(); return; }
    server.moduleGraph.invalidateAll();
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ ok: true }));
  });
}
