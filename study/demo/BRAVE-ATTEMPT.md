# Existing Brave session — local execution receipt

2026-10-25. Status: blocked by browser security handoff; not a completed overlay demo.

- Verified study/unmigrated-rtl-ui at 910133cc332af96268d19fc6563608434b2c321c in the Study worktree.
- Both existing local development servers returned HTTP 200. No restart was needed.
- Reviewed rtl-overlay.js: no network requests, storage access or application-state changes. Its DOM annotation layer is localhost-port restricted and removable. This is source review, not proof of runtime safety or successful operation.
- Controlled the existing native Brave session using CUA accessibility/keyboard controls. No separate automated browser was launched.
- Opened http://127.0.0.1:4200/ and verified the English LTR interface.
- Opened the existing opt-in demo with lang=en because the plain root has no language selector.
- Clicked the real language selector and selected العربية. URL changed to lang=ar and the actual interface changed language/layout.
- Visually reconfirmed left sidebar, reversed logo composition, KPI label/icon overlap, and reversed month labels relative to the unchanged chart. No new DOM measurement claim is made for Brave; earlier in-app-browser measurements are in observations.json.
- Existing Playwright API is read-only for evaluation, so script injection through that API is unsupported.
- Tried the reviewed local loader in native DevTools Console. Brave displayed its Self-XSS warning and rejected the paste. Did not type allow pasting, disable protections, or execute the helper.
- Did not route the same blocked code through a Snippet/extension to evade the active warning. No extension was installed.
- Red borders, keyboard shortcuts, click-through and destroy behavior remain unverified. No new Invoicing/Procurement traversal after this security stop, no new VS Code source navigation, and no OBS recording are claimed.

## Evidence

- evidence/brave-01-english.jpg — real existing Brave session at English root.
- evidence/brave-02-security-warning.jpg — actual Arabic interface and the blocking browser warning.

## Remaining human step

The browser warning must be handled personally by the user. The Console is left open at the warning. After the user reviews the helper and completes that browser action, the existing load-overlay.js can be loaded and the live acceptance sequence in README.md executed. No global security-setting changes are necessary.

## Integrity

Before/after tracked diff SHA-256:
8f4613a1f34bed33bd3ade806c44368bd81a680b201a7dc8b4eccd9046331670

No tracked application/configuration changes, commit, push, tag, other-worktree operation, policy/pin change or baseline update was performed. New files for this attempt are limited to this receipt and the two evidence images under study/demo.
