import { describe, expect, it } from 'vitest';
import { retryAcrossNavigation } from '../src/page-navigation.js';

const destroyed = () => new Error('page.evaluate: Execution context was destroyed, most likely because of a navigation.');

describe('retryAcrossNavigation', () => {
  it('re-runs work that raced a dev-server reload', async () => {
    let calls = 0;
    await expect(retryAcrossNavigation(async () => { if (++calls < 3) throw destroyed(); return 'ok'; })).resolves.toBe('ok');
    expect(calls).toBe(3);
  });
  it('stops after the bounded number of attempts', async () => {
    let calls = 0;
    await expect(retryAcrossNavigation(async () => { calls++; throw destroyed(); }, 2)).rejects.toThrow('Execution context was destroyed');
    expect(calls).toBe(2);
  });
  it('never retries unrelated failures', async () => {
    let calls = 0;
    await expect(retryAcrossNavigation(async () => { calls++; throw new Error('DIRECTION_EVIDENCE_ROUTE_CHANGED'); })).rejects.toThrow('DIRECTION_EVIDENCE_ROUTE_CHANGED');
    expect(calls).toBe(1);
  });
});
