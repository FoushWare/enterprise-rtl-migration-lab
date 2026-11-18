import {enterReview} from './enter-review';
import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const findingId = 'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea';
const path = 'apps/invoicing/src/components/InvoiceTable.tsx';
const sha = (value: string) => createHash('sha256').update(value).digest('hex');

test('embeds original and isolated candidate, survives occupied port and retries without duplicate mutations', async ({ page, request }, info) => {
  const root = info.config.metadata.portableFixtureRoot as string;
  if (!root?.includes('rtl-analyzer-e2e-')) throw Error('DISPOSABLE_FIXTURE_REQUIRED');
  const original = readFileSync(join(root, path), 'utf8');
  const events: any[] = [], errors: string[] = [], logs: string[] = [], pending: Promise<void>[] = [];
  const blocker = createServer((_req, res) => res.end('unrelated-port-owner'));
  await new Promise<void>((resolve, reject) => { blocker.once('error', reject); blocker.listen(4202, '127.0.0.1', resolve); });
  page.on('console', message => logs.push(`${message.type()}: ${message.text()}`));
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => { if (req.url().includes('127.0.0.1:4318') && req.method() !== 'OPTIONS') events.push({ method: req.method(), url: req.url(), body: req.postDataJSON() }); });
  page.on('response', response => { if (!response.url().includes('127.0.0.1:4318') || response.request().method() === 'OPTIONS') return; pending.push((async () => { const event = events.find(e => e.url === response.url() && e.method === response.request().method() && e.status === undefined); if (event) { event.status = response.status(); event.response = response.ok() ? await Promise.race([response.json().catch(() => null), new Promise(resolve => setTimeout(() => resolve(null), 3000))]) : null; } })()); });
  let failStart = true;
  await page.route('**/review/workflows/*/runtime', route => {
    if (failStart) { failStart = false; return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'SIMULATED_STARTUP_FAILURE' }), headers: { 'access-control-allow-origin': 'http://127.0.0.1:4320' } }); }
    return route.continue();
  });
  const count = (suffix: string) => events.filter(e => e.method === 'POST' && new URL(e.url).pathname.endsWith(suffix)).length;
  try {
    await page.goto('?finding=' + encodeURIComponent(findingId), { waitUntil: 'networkidle' });
    await enterReview(page);
    await expect(page.locator('.after-card pre')).toHaveText('<bdi dir="auto">{i.id}</bdi>');
    await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state', 'ready', { timeout: 20_000 });
    expect(count('/review/sessions')).toBe(0);
    const before = page.frameLocator('iframe[title="Before: original application route"]');
    await expect(before.locator('.invoice-link').first()).toHaveText(/INV-/);
    await expect(before.locator('.invoice-link bdi')).toHaveCount(0);
    await page.getByRole('button', { name: 'Apply & Preview', exact: true }).click();
    await expect(page.locator('.analysis-status')).toContainText('SIMULATED_STARTUP_FAILURE');
    expect(count('/review/workflows')).toBe(1); expect(count('/change')).toBe(1);
    await page.getByRole('button', { name: 'Apply & Preview', exact: true }).click();
    await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state', 'ready', { timeout: 30_000 });
    await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state', 'ready');
    const after = page.frameLocator('iframe[title="After: isolated candidate application route"]');
    await expect(after.locator('.invoice-link bdi[dir="auto"]').first()).toHaveText(/INV-/);
    expect(await before.locator('.invoice-link').allTextContents()).toEqual(await after.locator('.invoice-link').allTextContents());
    await Promise.all(pending);
    const session = events.find(e => e.method === 'POST' && new URL(e.url).pathname.endsWith('/change')).response.workflow.session;
    const runtimeSession = events.find(e => e.url.endsWith('/runtime') && e.status === 200).response.workflow.session;
    const runtime={id:runtimeSession.id,runtime:runtimeSession.runtime};
    expect(runtime.runtime.status).toBe('healthy'); expect(runtime.runtime.port).not.toBe(4202);
    await expect(page.locator('.component-after iframe')).toHaveAttribute('data-session-id', session.id);
    expect(await request.get('http://127.0.0.1:4202/').then(r => r.text())).toBe('unrelated-port-owner');
    await page.getByRole('button', { name: 'Open candidate preview', exact: true }).click();
    await expect.poll(() => count('/runtime')).toBe(3);
    await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready');
    expect(count('/review/workflows')).toBe(1); expect(count('/change')).toBe(1);
    const workflowId=events.find(e=>e.url.endsWith('/review/workflows')&&e.method==='POST').response.workflow.id;
    const concurrent = await Promise.all([1, 2].map(() => request.post('http://127.0.0.1:4318/review/workflows/' + workflowId + '/runtime', { headers: { Origin: 'http://127.0.0.1:4320' },data:{} }).then(r => r.json())));
    expect(concurrent.map(x => x.workflow.session.runtime.origin)).toEqual([runtime.runtime.origin, runtime.runtime.origin]);
    // Two different session startups must reserve different ports; cleaning either must spare the main runtime and the unrelated owner.
    const entry=events.find(e=>e.url.endsWith('/review/workflows')&&e.method==='POST').response.workflow.entries.find((e:any)=>e.finding.id===findingId);
    const analysis={patch:entry.patch};
    const otherSessions = await Promise.all([1, 2].map(async () => {
      const headers = { Origin: 'http://127.0.0.1:4320' };
      const session = await request.post('http://127.0.0.1:4318/review/sessions', { headers }).then(r => r.json());
      await request.post('http://127.0.0.1:4318/review/sessions/' + session.id + '/patch', { headers, data: analysis.patch });
      const started = await request.post('http://127.0.0.1:4318/review/sessions/' + session.id + '/runtime/start', { headers }).then(r => r.json());
      return { id: session.id, runtime: started.runtime };
    }));
    expect(new Set([runtime.runtime.port, ...otherSessions.map(x => x.runtime.port)]).size).toBe(3);
    for (const other of otherSessions) {
      expect(await request.get(other.runtime.origin + '/__rtl_preview_identity').then(r => r.json())).toMatchObject({ sessionId: other.id, role: 'candidate' });
      expect((await request.post('http://127.0.0.1:4318/review/sessions/' + other.id + '/cleanup', { headers: { Origin: 'http://127.0.0.1:4320' } })).ok()).toBe(true);
    }
    expect(await request.get('http://127.0.0.1:4202/').then(r => r.text())).toBe('unrelated-port-owner');
    expect(await request.get(runtime.runtime.origin + '/__rtl_preview_identity').then(r => r.json())).toMatchObject({ sessionId: session.id });
    await page.locator('.component-review').screenshot({ path: info.outputPath('embedded-ltr.png') });
    await page.locator('.component-toolbar').getByRole('button', { name: 'RTL', exact: true }).click();
    await expect(before.locator('html')).toHaveAttribute('dir', 'rtl'); await expect(after.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state', 'ready');
    await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state', 'ready');
    await page.locator('.component-toolbar').getByRole('button', { name: 'Desktop', exact: true }).click();
    await expect(before.locator('body')).toBeVisible();
    expect(await before.locator('body').evaluate(() => innerWidth)).toBe(768); expect(await after.locator('body').evaluate(() => innerWidth)).toBe(768);
    await page.getByRole('button', { name: 'Tablet', exact: true }).click();
    expect(await before.locator('body').evaluate(() => innerWidth)).toBe(390); expect(await after.locator('body').evaluate(() => innerWidth)).toBe(390);
    await page.getByRole('button', { name: 'Mobile', exact: true }).click();
    await page.getByRole('button', { name: 'Expand', exact: true }).click();
    await expect(page.locator('.component-review')).toHaveClass(/embedded-expanded/);
    await page.screenshot({ path: info.outputPath('embedded-expanded-rtl.png'), fullPage: true });
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.locator('.component-toolbar').getByRole('button', { name: 'LTR', exact: true }).click();
    await expect(before.locator('html')).toHaveAttribute('dir', 'ltr'); await expect(after.locator('html')).toHaveAttribute('dir', 'ltr');
    await page.screenshot({ path: info.outputPath('embedded-dashboard.png'), fullPage: true });
    // A forged cross-origin status cannot replace the actual readiness state.
    await page.evaluate(() => window.dispatchEvent(new MessageEvent('message', { origin: 'http://unrelated.invalid', data: { type: 'rtl-preview-status', rendered: true, dir: 'rtl' } })));
    await expect(page.locator('.component-after .embedded-state')).toContainText('LTR');
    await page.locator('.finding').filter({ hasText: 'Directional icon requires semantic review' }).first().click();
    await expect(page.locator('.component-before iframe')).toHaveCount(1);
    await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready');
    await expect(page.locator('.component-helper')).toContainText('No automatic fix');
    await page.locator('.finding').first().click();
    await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state', 'ready');
    expect(count('/review/workflows')).toBe(1); expect(count('/change')).toBe(1);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await enterReview(page);
    await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state', 'ready', { timeout: 20_000 });
    await expect(page.locator('.component-after iframe')).toHaveAttribute('data-session-id', session.id);
    expect(count('/review/workflows')).toBe(1); expect(count('/change')).toBe(1);
    expect(readFileSync(join(root, path), 'utf8')).toBe(original);
    const response = await request.get(runtime.runtime.origin + '/src/components/InvoiceTable.tsx');
    const encoded = (await response.text()).match(/sourceMappingURL=data:application\/json;base64,([^\s]+)/)!;
    const map = JSON.parse(Buffer.from(encoded[1], 'base64').toString());
    const candidate = readFileSync(map.file, 'utf8');
    expect(candidate).toContain('<bdi dir="auto">{i.id}</bdi>');
    expect(errors).toEqual([]);
    writeFileSync(info.outputPath('acceptance.json'), JSON.stringify({ sessionId: session.id, runtime, root, candidateFile: map.file, originalBefore: sha(original), originalAfter: sha(readFileSync(join(root, path), 'utf8')), candidateHash: sha(candidate), originalDomBdi: 0, candidateDomBdi: await after.locator('.invoice-link bdi').count(), modes: ['ltr', 'rtl'], viewports: [1280, 768, 390], expanded: true, blockerStillAlive: true, concurrentSessionsCleaned: otherSessions, errors, events }, null, 2));
  } finally {
    await Promise.all(pending);
    writeFileSync(info.outputPath('network.json'), JSON.stringify(events, null, 2));
    writeFileSync(info.outputPath('console.json'), JSON.stringify({ logs, errors }, null, 2));
    await new Promise<void>(resolve => blocker.close(() => resolve()));
  }
});

test('distinguishes original unavailable from an HTTP 200 frame without rendered application evidence', async ({ page }, info) => {
  await page.route('http://127.0.0.1:4200/invoices?*', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>No application bridge</title>' }));
  await page.goto('?finding=' + encodeURIComponent(findingId), { waitUntil: 'domcontentloaded' });
  await enterReview(page);
  await expect(page.locator('.after-card pre')).toHaveText('<bdi dir="auto">{i.id}</bdi>');
  await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state', 'error', { timeout: 20_000 });
  await expect(page.locator('.component-before .embedded-state')).toContainText('Embedding blocked or local preview bridge unavailable');
  await page.locator('.component-review').screenshot({ path: info.outputPath('embedding-unconfirmed.png') });
  await page.unroute('http://127.0.0.1:4200/invoices?*');
  await page.locator('.finding.selected').click();
  await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state', 'ready');
  await page.route('**/contextual-preview**', async route => {
    const response = await route.fetch(); const data = await response.json();
    await route.fulfill({ response, json: { ...data, original:{...data.original,available:false,reason:'Original application unavailable'} } });
  });
  await page.locator('.finding.selected').click();
  await expect(page.locator('.component-before .embedded-state')).toContainText('Original application unavailable');
  await expect(page.locator('.component-before iframe')).toHaveCount(0);
  await page.unroute('**/contextual-preview**');
  await page.locator('.finding.selected').click();
  await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state', 'ready');
});
