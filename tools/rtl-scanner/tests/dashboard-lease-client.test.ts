import { describe, expect, it } from 'vitest';
import { createDashboardLeaseClient, type DashboardLeaseEnvironment } from '../src/dashboard-lease-client.js';
import { OriginalPreviewLeases } from '../src/original-preview-leases.js';
import { contextualPreviewClientSource } from '../src/dashboard-contextual-preview.js';

function fakeEnv() {
  const sent: { url: string; init: { method: string; keepalive: boolean; headers: Record<string, string>; body: string } }[] = [];
  const listeners: Record<string, () => void> = {};
  const env: DashboardLeaseEnvironment = {
    origin: 'http://127.0.0.1:4318',
    send: async (url, init) => { sent.push({ url, init }); return {}; },
    target: { addEventListener: (type, listener) => { listeners[type] = listener; } },
  };
  return { env, sent, listeners };
}

const releaseBodies = (sent: ReturnType<typeof fakeEnv>['sent']) => sent.map(s => JSON.parse(s.init.body));

describe('dashboard lease client', () => {
  it('releases the dashboard-owned lease on session end, with keepalive, to the release route', () => {
    const { env, sent } = fakeEnv();
    const client = createDashboardLeaseClient(env);
    client.remember({ application: 'dashboard', token: 'page-1' });
    client.endSession();
    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe('http://127.0.0.1:4318/contextual-preview/original/release');
    expect(sent[0].init).toMatchObject({ method: 'POST', keepalive: true });
    expect(releaseBodies(sent)).toEqual([{ application: 'dashboard', lease: 'page-1' }]);
  });

  it('makes repeated release safe: a second end sends nothing', () => {
    const { env, sent } = fakeEnv();
    const client = createDashboardLeaseClient(env);
    client.remember({ application: 'dashboard', token: 'page-1' });
    client.endSession();
    client.endSession();
    client.endSession();
    expect(sent).toHaveLength(1);
    expect(client.tokenFor('dashboard')).toBeUndefined();
  });

  it('keeps one lease per application across retries and repeated starts', () => {
    const { env, sent } = fakeEnv();
    const client = createDashboardLeaseClient(env);
    client.remember({ application: 'dashboard', token: 'page-1' });
    // A retry presents the held token; the companion returns the same token, so remember() is a no-op.
    client.remember({ application: 'dashboard', token: 'page-1' });
    client.remember({ application: 'dashboard', token: 'page-1' });
    expect(client.tokenFor('dashboard')).toBe('page-1');
    client.endSession();
    expect(releaseBodies(sent)).toEqual([{ application: 'dashboard', lease: 'page-1' }]);
  });

  it('never releases a token the page did not receive, so the CLI-owned lease is untouched', () => {
    const { env, sent } = fakeEnv();
    const client = createDashboardLeaseClient(env);
    expect(client.tokenFor('dashboard')).toBeUndefined();
    client.remember(undefined);
    client.remember({ application: 'dashboard' });
    client.remember({ application: 42, token: 'x' });
    client.endSession();
    expect(sent).toEqual([]);
  });

  it('releases on pagehide as a fallback, and a failing request does not throw', async () => {
    const { env, sent, listeners } = fakeEnv();
    const client = createDashboardLeaseClient(env);
    client.remember({ application: 'dashboard', token: 'page-1' });
    expect(listeners.pagehide).toBeTypeOf('function');
    listeners.pagehide();
    expect(releaseBodies(sent)).toEqual([{ application: 'dashboard', lease: 'page-1' }]);
    expect(client.tokenFor('dashboard')).toBeUndefined();

    const failing = fakeEnv();
    const other = createDashboardLeaseClient({ ...failing.env, send: async () => { throw new Error('network'); } });
    other.remember({ application: 'dashboard', token: 'page-2' });
    expect(() => other.endSession()).not.toThrow();
  });

  it('injects the same client into the dashboard page source', () => {
    expect(contextualPreviewClientSource).toContain('createDashboardLeaseClient(');
    expect(contextualPreviewClientSource).toContain('dashboardLease');
    expect(contextualPreviewClientSource).toMatch(/addEventListener\(["']pagehide["']/);
    expect(contextualPreviewClientSource).toContain('keepalive: true');
  });
});

describe('dashboard and CLI sharing one original server', () => {
  it('keeps the server while either holder remains, and reports the dashboard token as not held after release', () => {
    const leases = new OriginalPreviewLeases();
    const key = 'root|dashboard';
    const cli = leases.acquire(key);
    const page = leases.acquire(key);
    expect(leases.has(key, page)).toBe(true);
    expect(leases.release(key, page)).toEqual({ last: false });
    expect(leases.has(key, page)).toBe(false);
    expect(leases.has(key, cli)).toBe(true);
    expect(leases.release(key, cli)).toEqual({ last: true });
  });

  it('a retried start that presents a live token gets the same lease, so the count does not grow', () => {
    const leases = new OriginalPreviewLeases();
    const key = 'root|dashboard';
    const page = leases.acquire(key);
    // Mirrors the companion route: reuse the presented token when it is still live, else mint a new one.
    const reissue = (presented?: string) => (presented && leases.has(key, presented) ? presented : leases.acquire(key));
    expect(reissue(page)).toBe(page);
    expect(reissue(page)).toBe(page);
    expect(leases.count()).toBe(1);
    leases.release(key, page);
    expect(reissue(page)).not.toBe(page);
    expect(leases.count()).toBe(1);
  });
});
