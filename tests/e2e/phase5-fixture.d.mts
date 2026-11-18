import type { Finding } from '../../tools/rtl-scanner/src/model.js';
import type { ScanManifest } from '../../tools/rtl-scanner/src/scan-history.js';
export const phase5Findings: Finding[];
export const phase5Manifest: ScanManifest;
export function writePhase5Dashboard(directory: string): void;
export function writePhase5ProjectFixture(project: string): void;
