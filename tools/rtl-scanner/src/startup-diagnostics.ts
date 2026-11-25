// Opt-in startup diagnostics for the preview companion (RTL_COMPANION_DIAGNOSTICS=1). Each line is written synchronously to
// stderr so it survives a stall or a crash. Lines carry stage names, durations and process metadata only: never environment
// values, source content, or credentials.
import { writeSync } from 'node:fs';

export const diagnosticsEnabled = process.env.RTL_COMPANION_DIAGNOSTICS === '1';
const started = Date.now();
type Detail = Record<string, string | number | boolean | null>;

export function diag(stage: string, detail: Detail = {}): void {
  if (!diagnosticsEnabled) return;
  const fields = Object.entries(detail).map(([key, value]) => ` ${key}=${JSON.stringify(value)}`).join('');
  try { writeSync(2, `[companion-diag ${new Date().toISOString()} +${Date.now() - started}ms pid=${process.pid}] ${stage}${fields}\n`); } catch { /* diagnostics must never change behaviour */ }
}
