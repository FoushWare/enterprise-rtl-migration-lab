import { describe, expect, it } from 'vitest';
import { createServer } from 'node:net';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startStaticReportServer } from '../../../tests/e2e/static-report-server.mjs';

// Runs the smoke test's report server on an ephemeral loopback port. Every refused request must be refused explicitly.

async function fixture() {
  const base = await mkdtemp(join(realpathSync(tmpdir()), 'rtl-static-'));
  const reports = join(base, 'reports');
  await mkdir(reports);
  await writeFile(join(reports, 'rtl-report-dashboard.html'), '<!doctype html><title>report</title>');
  await writeFile(join(reports, 'rtl-report.json'), '{"complete":true}\n');
  await writeFile(join(base, 'secret.txt'), 'OUTSIDE-SECRET');
  await mkdir(join(reports, 'nested'));
  await writeFile(join(reports, 'nested', 'deep.md'), 'deep');
  await symlink(join(base, 'secret.txt'), join(reports, 'linked.txt'));
  const server = await startStaticReportServer({ directory: reports, port: 0 });
  return { base, server };
}

async function request(url: string, method = 'GET') {
  const response = await fetch(url, { method });
  return { status: response.status, type: response.headers.get('content-type') ?? '', body: method === 'HEAD' ? '' : await response.text() };
}

describe('smoke test static report server', () => {
  it('binds to loopback only', async () => {
    const { base, server } = await fixture();
    try {
      expect(new URL(server.url).hostname).toBe('127.0.0.1');
    } finally { await server.close(); await rm(base, { recursive: true, force: true }); }
  });

  it('serves intended report files with their content types', async () => {
    const { base, server } = await fixture();
    try {
      const html = await request(`${server.url}/rtl-report-dashboard.html`);
      expect(html).toMatchObject({ status: 200, type: 'text/html; charset=utf-8' });
      expect(html.body).toContain('<title>report</title>');
      expect(await request(`${server.url}/rtl-report.json`)).toMatchObject({ status: 200, type: 'application/json; charset=utf-8' });
      expect((await request(`${server.url}/rtl-report-dashboard.html`, 'HEAD')).status).toBe(200);
    } finally { await server.close(); await rm(base, { recursive: true, force: true }); }
  });

  it('refuses traversal, encoded traversal, separators and NUL bytes without reading outside the report directory', async () => {
    const { base, server } = await fixture();
    try {
      for (const path of ['/../secret.txt', '/..%2Fsecret.txt', '/%2e%2e%2fsecret.txt', '/..%5csecret.txt', '/nested%2Fdeep.md', '/%00rtl-report.json', '/%2e%2e']) {
        const response = await request(`${server.url}${path}`);
        expect(response.status, path).toBe(404);
        expect(response.body, path).not.toContain('OUTSIDE-SECRET');
      }
    } finally { await server.close(); await rm(base, { recursive: true, force: true }); }
  });

  it('refuses symlinks, subdirectories, hidden names and missing files', async () => {
    const { base, server } = await fixture();
    try {
      for (const path of ['/linked.txt', '/nested', '/.env', '/missing.html']) {
        const response = await request(`${server.url}${path}`);
        expect(response.status, path).toBe(404);
        expect(response.body, path).not.toContain('OUTSIDE-SECRET');
      }
    } finally { await server.close(); await rm(base, { recursive: true, force: true }); }
  });

  it('accepts only GET and HEAD', async () => {
    const { base, server } = await fixture();
    try {
      expect((await request(`${server.url}/rtl-report.json`, 'POST')).status).toBe(405);
      expect((await request(`${server.url}/rtl-report.json`, 'PUT')).status).toBe(405);
    } finally { await server.close(); await rm(base, { recursive: true, force: true }); }
  });

  it('releases its port when closed', async () => {
    const { base, server } = await fixture();
    const port = Number(new URL(server.url).port);
    await server.close();
    await rm(base, { recursive: true, force: true });
    await new Promise<void>((yes, no) => {
      const probe = createServer();
      probe.once('error', no);
      probe.listen(port, '127.0.0.1', () => probe.close(() => yes()));
    });
  });
});
