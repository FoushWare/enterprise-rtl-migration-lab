import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scan } from '../src/scan.js';
import { ApplyAuditStore, ControlledApplyService } from '../src/controlled-apply.js';
import { ReviewWorkflowStore } from '../src/review-workflow.js';
import { createReviewSession, disposeReviewSession, repositoryRelativeFromCopyPath } from '../src/review-session.js';

// These tests must pass on Windows, macOS and Linux. Repository keys are POSIX on every platform; platform path
// functions and fs.cp reports may use backslashes on Windows.

describe('copy paths are converted to repository-relative POSIX form', () => {
  it('converts POSIX copy paths', () => {
    expect(repositoryRelativeFromCopyPath('/proj', '/proj/apps/invoicing/src/a.tsx', '/')).toBe('apps/invoicing/src/a.tsx');
  });

  it('converts Windows-style copy paths with backslash separators', () => {
    expect(repositoryRelativeFromCopyPath('C:\\proj', 'C:\\proj\\apps\\invoicing\\src\\a.tsx', '\\')).toBe('apps/invoicing/src/a.tsx');
    expect(repositoryRelativeFromCopyPath('C:\\proj', 'C:\\proj\\package.json', '\\')).toBe('package.json');
  });

  it('maps the copy root itself to the empty repository path', () => {
    expect(repositoryRelativeFromCopyPath('/proj', '/proj', '/')).toBe('');
    expect(repositoryRelativeFromCopyPath('C:\\proj', 'C:\\proj', '\\')).toBe('');
  });
});

async function nxFixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'rtl-cross-platform-')));
  await mkdir(join(root, 'apps/invoicing/src/components'), { recursive: true });
  await mkdir(join(root, 'libs/ui/src'), { recursive: true });
  await writeFile(join(root, 'apps/invoicing/project.json'), JSON.stringify({ sourceRoot: 'apps/invoicing/src' }));
  await writeFile(join(root, 'apps/invoicing/tsconfig.app.json'), '{}');
  await writeFile(join(root, 'apps/invoicing/index.html'), '<html dir="ltr"><body></body></html>');
  await writeFile(join(root, 'apps/invoicing/src/components/InvoiceTable.tsx'), 'export const View=({a}:{a:{id:string}})=><span>{a.id}</span>;');
  await writeFile(join(root, 'libs/ui/project.json'), JSON.stringify({ sourceRoot: 'libs/ui/src' }));
  await writeFile(join(root, 'libs/ui/src/index.tsx'), 'export const Button=()=><button>ok</button>;');
  for (const name of ['package.json', 'nx.json', 'tsconfig.json']) await writeFile(join(root, name), '{}');
  await writeFile(join(root, 'rtl-scanner.config.json'), JSON.stringify({ schemaVersion: 1, generatedStyleOwner: 'unknown', ownership: {}, approvals: [], exceptions: [], issueBindings: [], dynamicExceptions: [], roles: [] }));
  return root;
}

describe('review workflow records repository-relative project configuration keys', () => {
  it('uses POSIX keys for apps and libs project configuration in the workflow baseline', async () => {
    const root = await nxFixture();
    try {
      const audit = new ApplyAuditStore(join(root, 'state/audit.json'));
      const apply = new ControlledApplyService(root, audit, join(root, 'state/backups'));
      const store = new ReviewWorkflowStore(root, join(root, 'state/workflows.json'), apply);
      await store.load();
      const report = await scan(root);
      const workflow = await store.begin({ ...report, mode: 'apply-first' });
      const keys = Object.keys(workflow.baseline);
      expect(keys.filter(key => key.includes('\\'))).toEqual([]);
      expect(keys).toContain('apps/invoicing/project.json');
      expect(keys).toContain('apps/invoicing/tsconfig.app.json');
      expect(keys).toContain('libs/ui/project.json');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe('candidate copy keeps nested sources', () => {
  it('creates a candidate that contains a nested source file and its project configuration', async () => {
    const root = await nxFixture();
    try {
      const session = await createReviewSession(root, 'apps/invoicing/src/components/InvoiceTable.tsx');
      try {
        expect(session.sourcePath).toBe('apps/invoicing/src/components/InvoiceTable.tsx');
        const { readFile } = await import('node:fs/promises');
        expect(await readFile(join(session.candidateRoot, 'apps/invoicing/src/components/InvoiceTable.tsx'), 'utf8')).toContain('export const View');
        expect(await readFile(join(session.candidateRoot, 'apps/invoicing/project.json'), 'utf8')).toContain('sourceRoot');
      } finally {
        await disposeReviewSession(session);
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
