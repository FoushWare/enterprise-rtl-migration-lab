// Resolves the scanner runtime directory for the e2e harness.
//
// Precedence:
//   1. RTL_E2E_RUNTIME, an explicit override (always wins).
//   2. Wrapper layout: this implementation sits inside the rtl-analyzer wrapper, which has scripts/build-e2e-dist.mjs.
//      Use the wrapper's provenance-verified build at <wrapper>/dist/tools/rtl-scanner.
//   3. Standalone layout: use this implementation's own build at <implementation>/dist/tools/rtl-scanner (npm run build).
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const implementation = resolve(fileURLToPath(new URL('../..', import.meta.url)));

export function resolveScannerRuntime() {
  if (process.env.RTL_E2E_RUNTIME) return resolve(process.env.RTL_E2E_RUNTIME);
  const wrapper = resolve(implementation, '..');
  if (existsSync(join(wrapper, 'scripts', 'build-e2e-dist.mjs'))) return join(wrapper, 'dist', 'tools', 'rtl-scanner');
  return join(implementation, 'dist', 'tools', 'rtl-scanner');
}

export const implementationRoot = implementation;
