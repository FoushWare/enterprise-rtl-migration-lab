/**
 * Dashboard-owned original-server leases. This function is self-contained: its compiled source is injected into the
 * dashboard page (see dashboard-contextual-preview.ts), so it must not reference anything outside its own body.
 *
 * - One token per application, taken from the companion's start response. A retried start presents the token back,
 *   so the companion returns it instead of issuing another (no accumulation).
 * - endSession() releases every token this page holds. Tokens are cleared before any request is sent, so repeated
 *   calls send nothing. The companion's release route rejects unknown or released tokens without stopping anything.
 * - The CLI-owned lease is never stored here; only tokens this page received are released.
 * - pagehide releases with keepalive so the request survives unload. The dashboard has no explicit end-of-review
 *   action, so leaving the page is the only session-end signal; keepalive makes that release survive unload.
 */
export interface DashboardLeaseEnvironment {
  readonly origin: string;
  readonly send: (url: string, init: { method: string; keepalive: boolean; headers: Record<string, string>; body: string }) => Promise<unknown>;
  readonly target: { addEventListener(type: string, listener: () => void): void };
}

export interface DashboardLeaseClient {
  tokenFor(application: string): string | undefined;
  remember(lease: { application?: unknown; token?: unknown } | undefined): void;
  endSession(): void;
}

export function createDashboardLeaseClient(env: DashboardLeaseEnvironment): DashboardLeaseClient {
  const held = new Map<string, string>();
  const client: DashboardLeaseClient = {
    tokenFor: application => held.get(application),
    remember: lease => {
      if (lease && typeof lease.application === 'string' && typeof lease.token === 'string') held.set(lease.application, lease.token);
    },
    endSession: () => {
      const releases = [...held.entries()];
      held.clear();
      for (const [application, token] of releases) {
        env.send(env.origin + '/contextual-preview/original/release', {
          method: 'POST',
          keepalive: true,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ application, lease: token }),
        }).catch(() => undefined);
      }
    },
  };
  env.target.addEventListener('pagehide', () => client.endSession());
  return client;
}
