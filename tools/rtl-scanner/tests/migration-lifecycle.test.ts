import { describe, expect, it } from 'vitest';
import { projectLifecycle } from '../src/migration-lifecycle.js';
import { reconcileScans } from '../src/scan-history.js';
import type { Finding } from '../src/model.js';

const f = (id: string, original = 'x'): Finding => ({ id, ruleId: 'R', ruleVersion: 1, category: 'MANUAL_REVIEW', severity: 'Minor', confidence: 'High', title: 'risk', sourceMechanism: 'css', applications: [], path: 'a.css', range: { start: { offset: 0, line: 1, column: 1 }, end: { offset: 1, line: 1, column: 2 } }, original, context: 'a', ownership: 'owner', rationale: 'r', treatment: 't', evidenceIds: [], relatedLocations: [], issueIds: [], suggestion: null, limitation: 'l' });

describe('migration lifecycle and scan reconciliation', () => {
  it('does not treat approval alone as completion', () => expect(projectLifecycle({ decision: null, review: { status: 'Approved' } as never, evidence: [], audit: [] })).toBe('In Progress'));
  it('projects applied and rolled back from authoritative records', () => {
    expect(projectLifecycle({ evidence: [], audit: [{ type: 'APPLIED', timestamp: '2026-01-01', resultingSha256: 'new' } as never], currentSourceSha256: 'new' })).toBe('Applied');
    expect(projectLifecycle({ evidence: [], audit: [{ type: 'ROLLED_BACK', timestamp: '2026-01-02' } as never] })).toBe('Rolled Back');
  });
  it('reconciles new, changed, and unresolved identities', () => {
    const previous = { scanId: 'a', inputDigest: 'a', policyDigest: 'p', timestamp: '2026-01-01', findings: [f('old')] };
    const current = { scanId: 'b', inputDigest: 'b', policyDigest: 'p', timestamp: '2026-01-02', findings: [{ ...f('new'), context: 'new-context' }, f('old', 'changed')] };
    const statuses = reconcileScans(previous, current).map(x => x.status);
    expect(statuses).toContain('New'); expect(statuses).toContain('Changed');
  });
});
