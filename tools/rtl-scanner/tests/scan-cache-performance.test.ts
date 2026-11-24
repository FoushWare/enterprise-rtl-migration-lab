import { describe, expect, it, beforeEach } from 'vitest';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearScanCache, scan, scanCacheStats } from '../src/scan.js';

// Disposable fixtures only: every project is created under the OS temporary directory and removed afterwards.
async function fixture(files: Record<string, string>) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'rtl-scan-cache-')));
  for (const [path, text] of Object.entries(files)) {
    await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(join(root, path), text, 'utf8');
  }
  return root;
}

const LAYOUT = '.shell{position:fixed;width:200px;}\n.content{margin-left:200px;}\n.card{margin-left:8px;}\n';

describe('scan result cache', () => {
  beforeEach(() => clearScanCache());

  it('serves an identical repeat scan from the cache and returns equal results', async () => {
    const root = await fixture({ 'src/layout.css': LAYOUT });
    try {
      const cold = await scan(root);
      const warm = await scan(root);
      expect(scanCacheStats).toEqual({ hits: 1, misses: 1 });
      expect(warm).toEqual(cold);
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it('misses after a source change and reports the new input digest', async () => {
    const root = await fixture({ 'src/layout.css': LAYOUT });
    try {
      const before = await scan(root);
      await writeFile(join(root, 'src/layout.css'), LAYOUT + '.extra{margin-right:4px;}\n', 'utf8');
      const after = await scan(root);
      expect(scanCacheStats.misses).toBe(2);
      expect(after.inputDigest).not.toBe(before.inputDigest);
      expect(after.evidence.length).toBeGreaterThan(before.evidence.length);
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it('misses when an unsupported file is added, because the skipped list is part of the report', async () => {
    const root = await fixture({ 'src/layout.css': LAYOUT });
    try {
      const before = await scan(root);
      await writeFile(join(root, 'src/logo.png'), 'not really a png', 'utf8');
      const after = await scan(root);
      expect(scanCacheStats.misses).toBe(2);
      expect(after.skipped.some(path => path.endsWith('logo.png'))).toBe(true);
      expect(after.skipped.length).toBeGreaterThan(before.skipped.length);
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it('misses when the raw policy text changes, even if its parsed value does not', async () => {
    const root = await fixture({ 'src/layout.css': LAYOUT });
    const policy = JSON.stringify({ schemaVersion: 1, generatedStyleOwner: 'unknown', ownership: {}, approvals: [], exceptions: [], issueBindings: [], dynamicExceptions: [], roles: [] });
    try {
      await scan(root);                                            // no policy file
      await writeFile(join(root, 'rtl-scanner.config.json'), policy, 'utf8');
      await scan(root);                                            // valid policy
      await writeFile(join(root, 'rtl-scanner.config.json'), policy + '\n', 'utf8'); // same parsed value, different text
      await scan(root);
      expect(scanCacheStats.misses).toBe(3);
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it('returns copies, so a caller cannot change what the next caller receives', async () => {
    const root = await fixture({ 'src/layout.css': LAYOUT });
    try {
      const first = await scan(root);
      first.findings.length = 0;
      first.evidence[0]!.value = 'mutated';
      const second = await scan(root);
      expect(second.findings.length).toBeGreaterThan(0);
      expect(second.evidence[0]!.value).not.toBe('mutated');
    } finally { await rm(root, { recursive: true, force: true }); }
  });
});

describe('fixed-position gutter coupling (indexed lookup must keep cross-file membership)', () => {
  it('reports a fixed width whose gutter margin is declared in another stylesheet', async () => {
    const root = await fixture({
      'src/shell.css': '.shell{position:fixed;width:240px;}\n',
      'src/gutter.css': '.gutter{margin-left:240px;}\n',
    });
    try {
      const report = await scan(root);
      expect(report.findings.some(f => f.ruleId === 'RTL.GEOMETRY.COUPLED')).toBe(true);
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it('does not couple a fixed width with an unrelated margin value', async () => {
    const root = await fixture({
      'src/shell.css': '.shell{position:fixed;width:240px;}\n',
      'src/gutter.css': '.gutter{margin-left:16px;}\n',
    });
    try {
      const report = await scan(root);
      expect(report.findings.some(f => f.ruleId === 'RTL.GEOMETRY.COUPLED')).toBe(false);
    } finally { await rm(root, { recursive: true, force: true }); }
  });
});
