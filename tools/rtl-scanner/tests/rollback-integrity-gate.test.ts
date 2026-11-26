import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ApplyAuditStore, ControlledApplyService } from '../src/controlled-apply.js';
import { ReviewWorkflowStore } from '../src/review-workflow.js';
import { scan } from '../src/scan.js';

// Rollback integrity gate: multiple transactions, tampered receipts, and source conflicts on the controlled apply service.
// Each applied transaction has its own receipts; rollback must target exactly the transaction it is given.

const first = 'apps/invoicing/src/components/InvoiceTable.tsx';
const second = 'apps/invoicing/src/components/Other.tsx';

async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'rtl-rollback-gate-')));
  await mkdir(join(root, 'apps/invoicing/src/components'), { recursive: true });
  await writeFile(join(root, first), 'export const View = () => <span>one</span>;');
  await writeFile(join(root, second), 'export const value = 1;');
  const audit = new ApplyAuditStore(join(root, 'state/audit.json'));
  const apply = new ControlledApplyService(root, audit, join(root, 'state/backups'));
  return { root, apply, audit };
}

describe('rollback integrity gate', () => {
  it('rolls back only the targeted transaction when two transactions touch different files', async () => {
    const { root, apply, audit } = await fixture();
    try {
      const firstBefore = await readFile(join(root, first), 'utf8');
      const secondBefore = await readFile(join(root, second), 'utf8');
      const receiptsA = await apply.applyAcceptedFiles('txn-a', [{ path: first, before: firstBefore, after: firstBefore + '// A' }], 'APPLY_CONFIRMED');
      const receiptsB = await apply.applyAcceptedFiles('txn-b', [{ path: second, before: secondBefore, after: secondBefore + '// B' }], 'APPLY_CONFIRMED');

      await apply.rollbackAcceptedFiles(receiptsA);
      expect(await readFile(join(root, first), 'utf8')).toBe(firstBefore);
      expect(await readFile(join(root, second), 'utf8')).toBe(secondBefore + '// B');

      await apply.rollbackAcceptedFiles(receiptsB);
      expect(await readFile(join(root, second), 'utf8')).toBe(secondBefore);
      expect((await audit.list()).filter(e => e.type === 'ROLLED_BACK')).toHaveLength(2);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('refuses to roll back an older transaction over a later transaction on the same file, and changes no byte', async () => {
    const { root, apply, audit } = await fixture();
    try {
      const before = await readFile(join(root, first), 'utf8');
      const receiptsA = await apply.applyAcceptedFiles('txn-a', [{ path: first, before, after: before + '// A' }], 'APPLY_CONFIRMED');
      const afterA = before + '// A';
      const receiptsB = await apply.applyAcceptedFiles('txn-b', [{ path: first, before: afterA, after: afterA + '// B' }], 'APPLY_CONFIRMED');

      await expect(apply.rollbackAcceptedFiles(receiptsA)).rejects.toThrow('ROLLBACK_CONFLICT');
      expect(await readFile(join(root, first), 'utf8')).toBe(afterA + '// B');
      expect((await audit.list()).filter(e => e.type === 'ROLLED_BACK')).toHaveLength(0);

      // The newer transaction is rolled back first; then the older one restores the original bytes.
      await apply.rollbackAcceptedFiles(receiptsB);
      expect(await readFile(join(root, first), 'utf8')).toBe(afterA);
      await apply.rollbackAcceptedFiles(receiptsA);
      expect(await readFile(join(root, first), 'utf8')).toBe(before);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('rejects tampered receipts as untrusted, without a byte change or an audit record', async () => {
    const { root, apply, audit } = await fixture();
    try {
      const before = await readFile(join(root, first), 'utf8');
      const receipts = await apply.applyAcceptedFiles('txn-a', [{ path: first, before, after: before + '// A' }], 'APPLY_CONFIRMED');
      const applied = await readFile(join(root, first), 'utf8');
      const auditCount = (await audit.list()).length;
      const [receipt] = receipts;
      const tampered = [
        { ...receipt, appliedSha256: '0'.repeat(64) },
        { ...receipt, originalSha256: '1'.repeat(64) },
        { ...receipt, auditId: 'forged-audit-id' },
        { ...receipt, path: second },
        { ...receipt, backupPath: '/untrusted/backup' },
      ];
      for (const forged of tampered) {
        await expect(apply.rollbackAcceptedFiles([forged])).rejects.toThrow('ROLLBACK_RECEIPT_UNTRUSTED');
      }
      expect(await readFile(join(root, first), 'utf8')).toBe(applied);
      expect((await audit.list()).length).toBe(auditCount);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe('rollback request gate', () => {
  it('refuses a workflow rollback without explicit confirmation or receipts, and changes no byte', async () => {
    const { root, apply } = await fixture();
    try {
      await mkdir(join(root, 'libs'));
      await writeFile(join(root, 'apps/invoicing/project.json'), JSON.stringify({ sourceRoot: 'apps/invoicing/src' }));
      await writeFile(join(root, 'apps/invoicing/index.html'), '<html dir="ltr"><body></body></html>');
      for (const name of ['package.json', 'nx.json', 'tsconfig.json']) await writeFile(join(root, name), '{}');
      await writeFile(join(root, 'rtl-scanner.config.json'), JSON.stringify({ schemaVersion: 1, generatedStyleOwner: 'unknown', ownership: {}, approvals: [], exceptions: [], issueBindings: [], dynamicExceptions: [], roles: [] }));
      const store = new ReviewWorkflowStore(root, join(root, 'state/workflows.json'), apply);
      await store.load();
      const report = await scan(root);
      const workflow = await store.begin({ inputDigest: report.inputDigest, policyDigest: report.policyDigest, mode: 'one-by-one' });
      const before = await readFile(join(root, first), 'utf8');
      await expect(store.rollback(workflow.id, '')).rejects.toThrow('ROLLBACK_CONFIRMATION_REQUIRED');
      await expect(store.rollback(workflow.id, 'ROLLBACK_CONFIRM')).rejects.toThrow('ROLLBACK_CONFIRMATION_REQUIRED');
      await expect(store.rollback(workflow.id, 'ROLLBACK_CONFIRMED')).rejects.toThrow('APPLY_RECEIPTS_REQUIRED');
      expect(await readFile(join(root, first), 'utf8')).toBe(before);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
