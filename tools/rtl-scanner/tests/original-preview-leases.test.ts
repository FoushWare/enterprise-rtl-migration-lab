import { describe, expect, it } from 'vitest';
import { OriginalPreviewLeases } from '../src/original-preview-leases.js';

describe('original preview leases', () => {
  it('issues unguessable per-start tokens', () => {
    const leases = new OriginalPreviewLeases();
    const a = leases.acquire('root|dashboard');
    const b = leases.acquire('root|dashboard');
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).not.toBe(b);
  });

  it('keeps a shared server alive until its last owning session releases it', () => {
    const leases = new OriginalPreviewLeases();
    const sessionA = leases.acquire('root|dashboard');
    const sessionB = leases.acquire('root|dashboard');
    expect(leases.count()).toBe(2);
    expect(leases.release('root|dashboard', sessionA)).toEqual({ last: false });
    expect(leases.count()).toBe(1);
    expect(leases.release('root|dashboard', sessionB)).toEqual({ last: true });
    expect(leases.count()).toBe(0);
  });

  it('rejects unknown, expired (already released), and foreign tokens without changing state', () => {
    const leases = new OriginalPreviewLeases();
    const owned = leases.acquire('root|dashboard');
    expect(() => leases.release('root|dashboard', 'not-a-token')).toThrow('ORIGINAL_LEASE_NOT_FOUND');
    expect(() => leases.release('root|other', owned)).toThrow('ORIGINAL_LEASE_NOT_FOUND');
    expect(leases.count()).toBe(1);
    leases.release('root|dashboard', owned);
    expect(() => leases.release('root|dashboard', owned)).toThrow('ORIGINAL_LEASE_NOT_FOUND');
    expect(leases.count()).toBe(0);
  });

  it('isolates keys: releasing one application never reports the other as last', () => {
    const leases = new OriginalPreviewLeases();
    const first = leases.acquire('root|dashboard');
    leases.acquire('root|checkout');
    expect(leases.release('root|dashboard', first)).toEqual({ last: true });
    expect(leases.count()).toBe(1);
  });
});
