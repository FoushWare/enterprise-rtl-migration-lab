import { mkdtemp, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_STARTUP_TIMEOUT_MS, loadPreviewConfiguration } from '../src/preview-configuration.js';

// Copies the Foundations Lab preview files into a temporary project, so the real config shape is validated.
const LAB = resolve(__dirname, '../../../../examples/foundations-lab');

async function project(startupTimeoutMs?: unknown) {
  const root = await mkdtemp(join(tmpdir(), 'rtl-timeout-'));
  await mkdir(join(root, 'src'), { recursive: true });
  for (const file of ['vite.config.mjs', 'src/app.js', 'src/lab.css', 'package.json']) await copyFile(join(LAB, file), join(root, file));
  const config = JSON.parse(await readFile(join(LAB, 'rtl-preview.config.json'), 'utf8'));
  if (startupTimeoutMs !== undefined) config.applications.foundations.startupTimeoutMs = startupTimeoutMs;
  await writeFile(join(root, 'rtl-preview.config.json'), JSON.stringify(config));
  return root;
}

describe('startupTimeoutMs configuration', () => {
  it('defaults to sixty seconds and loads when omitted', async () => {
    expect(DEFAULT_STARTUP_TIMEOUT_MS).toBe(60_000);
    const config = await loadPreviewConfiguration(await project());
    expect(config.applications.foundations.startupTimeoutMs).toBeUndefined();
  });

  it('accepts a value between ten seconds and three minutes', async () => {
    const config = await loadPreviewConfiguration(await project(90_000));
    expect(config.applications.foundations.startupTimeoutMs).toBe(90_000);
  });

  it.each([5_000, 999_999, 1.5, '60000', null])('rejects %s with a clear configuration error', async value => {
    await expect(loadPreviewConfiguration(await project(value))).rejects.toThrow(/startupTimeoutMs must be an integer from 10000 to 180000/);
  });
});
