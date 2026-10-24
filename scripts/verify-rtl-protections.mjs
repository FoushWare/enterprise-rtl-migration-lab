/**
 * Verify exact protected source/evidence hashes and reviewed exception records.
 * This check reads artifacts; it never refreshes pins or regenerates screenshots.
 */
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(
  await fs.readFile(
    new URL('../docs/autonomous/protected-evidence.json', import.meta.url),
    'utf8',
  ),
);
const root = new URL('../', import.meta.url);
for (const [file, expected] of Object.entries(manifest.hashes)) {
  const actual = createHash('sha256')
    .update(await fs.readFile(new URL(file, root)))
    .digest('hex');
  if (actual !== expected)
    throw new Error(`Protected evidence changed: ${file}`);
}
const policy = JSON.parse(
  await fs.readFile(new URL('rtl-scanner.config.json', root), 'utf8'),
);
for (const field of ['dynamicExceptions', 'exceptions']) {
  if (JSON.stringify(policy[field]) !== JSON.stringify(manifest[field]))
    throw new Error(`Protected ${field} changed`);
}
if (policy.approvals.length)
  throw new Error(
    'Production automation approvals require separate reviewed authorization',
  );
const files = Object.keys(manifest.hashes);
if (
  files.filter((f) => f.includes('baseline.spec.ts-snapshots/')).length !== 6 ||
  files.filter((f) => f.startsWith('docs/screenshots/phase-2a/')).length !== 68
)
  throw new Error('Protected screenshot inventory changed');
console.log(
  `Protected hashes verified: ${files.length} files; six English baselines, 68 documentary screenshots, archived reports and pinned sources; exception records unchanged.`,
);
