# Scanner footage proof of concept

Output: scanner-flow-poc.mp4 — 22.5 seconds, 1920×1080, 30 FPS, H.264/yuv420p, no audio.

Real AVFoundation screen recording of VS Code in enterprise-rtl-migration-lab-latest at b127325a14ad3bf8e70aede2a2e29b9dae638355. Edited with gentle zoom, fades and explanatory lower thirds. No simulated IDE or fabricated scanner results.

## Recorded example
- libs/design-system/src/styles.css:290 — .chart-labels, padding-left: 40px.
- tools/rtl-scanner/src/css.ts:4–15 — extractCss(), postcss.parse(), walkDecls(), fact(), returned evidence.
- Integrated terminal: npm run rtl:scan > "$POC/cli-output.txt".
- Node helper show-result.mjs selects a real evidence record and its linked finding from that output. Its summary is not the scanner's original console format.
- Actual report: 440 evidence facts, 42 findings, complete=true.
- Actual finding RTL.CSS.PHYSICAL:82212e990854fbb975d34448, MANUAL_REVIEW, Minor, High confidence. This is a static review risk, not proof of a visual defect.
- Rule source verified read-only in tools/rtl-scanner/src/rules.ts:27–31. The video shows its actual report identifier, not a filmed visit to its implementation.

## Automation and limitations
VS Code control recovered after leaving its hidden fullscreen/window state and foregrounding the project using the official code CLI. Integrated terminal interaction and source navigation were verified visually. The Mac later locked; recording stopped and locked-screen footage was excluded.

This is an editing/recording proof, not a complete debugger trace. The npm command's completed invocation is visible; its Enter/execution moment occurred before the final usable take. The helper execution and real output were captured. A further unlocked take is needed to film the rule implementation and the scanner launch continuously. No successful continuous five-step debugging recording is claimed.

## Preservation
All tracked-file SHA256 hashes matched the pre-recording baseline. HEAD remained unchanged. The existing nx.json modification was preserved. No dependencies were installed, no Git commits switched, no commits or pushes made. Scanner build output was generated in the ignored dist directory. Output files are under video-assets/scanner-poc; temporary selector files are under /private/tmp/rtl-poc.

Raw footage and scanner output are retained in raw/, with edit.py and show-result.mjs under scripts/ for reproducibility. No full video was produced.
