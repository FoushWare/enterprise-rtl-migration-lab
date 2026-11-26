// Playwright test entry point for specs that call the companion API with the request fixture.
//
// The request fixture acts as the dashboard's API client: it carries a companion session minted with the run's bootstrap
// secret (owner-only file). The session is set on the request context only. It must not be set as a global header in the
// Playwright config: those headers also apply to the page, where they override the dashboard guard's current token and
// keep sending a token the companion has revoked after a restart.
import { readFileSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import { join } from 'node:path';
import { test as base, expect } from '@playwright/test';

async function mintRunSession(): Promise<string | undefined> {
  try {
    const bootstrap = JSON.parse(readFileSync(join(tmpdir(), 'rtl-analyzer-auth-' + userInfo().uid, 'companion-4318.json'), 'utf8')).bootstrap;
    const response = await fetch('http://127.0.0.1:4318/auth/session', { method: 'POST', headers: { 'x-rtl-companion-bootstrap': bootstrap } });
    return ((await response.json()) as { token: string }).token;
  } catch {
    return undefined;
  }
}

export const test = base.extend({
  request: async ({ playwright, baseURL }, use) => {
    const token = await mintRunSession();
    const context = await playwright.request.newContext({ baseURL, extraHTTPHeaders: token ? { 'x-rtl-companion-session': token } : undefined });
    await use(context);
    await context.dispose();
  },
});

export { expect };
