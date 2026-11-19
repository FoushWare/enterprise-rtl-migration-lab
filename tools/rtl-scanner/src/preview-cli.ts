#!/usr/bin/env node
// Keep help independent of project configuration and persisted review stores.
const args = process.argv.slice(2);
if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
  console.log(`Usage: RTL_PROJECT_ROOT=/absolute/project rtl-preview

Start the local review companion on http://127.0.0.1:4318.
Serve generated dashboard artifacts at http://127.0.0.1:4320.
Configure rtl-project.config.json and rtl-preview.config.json for standalone Vite projects.
Install the project's dependencies and Playwright Chromium before runtime validation.
Review state defaults to ~/.rtl-migration-analyzer; Apply backups default to OS temporary storage.
See README for RTL_* overrides and required state filenames.
Use Ctrl-C to stop the companion and its owned preview runtimes.`);
} else if (args.length) {
  console.error('Unknown option. Use rtl-preview --help.');
  process.exitCode = 2;
} else {
  await import('./preview-companion.js');
}
export {};
