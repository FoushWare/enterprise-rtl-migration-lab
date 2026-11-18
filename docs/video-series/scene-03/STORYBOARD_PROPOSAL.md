# Scene 03 — Storyboard Proposal

Draft — Pending Review. Proposal only. No recording, editing, sound production or final timing was performed.

## Educational story

Egyptian Arabic: «قبل ما نصلّح العربي، نفهم مين مسؤول عن الداتا، ومين مسؤول عن اللغة، ومين مسؤول عن شكل الواجهة. هنمشي مع فاتورة حقيقية في المشروع، وبعدها نشوف ليه تغيير dir لوحده مش كفاية.»

English: “Before changing RTL behavior, trace the data owner, the locale owner and the styling owner. Follow one real invoice, then examine why changing document direction alone leaves the styling runtime inconsistent.”

## Proposed real footage sequence

Timing below is editorial planning, not existing footage or measured command duration.

| Segment | Proposed time | Real developer action / evidence | Teaching point / localized callout |
| --- | --- | --- | --- |
| Identity | 10–15s | Full-screen VS Code terminal: pwd, git branch --show-current, git rev-parse HEAD, git status --short | «دي Study وفيها تغييرات مقصودة» / “Study checkout with intentional local changes.” Keep branch/status readable. |
| Workspace | 15–20s | VS Code Explorer opens apps, libs, tools; open both App imports and tsconfig aliases | «تطبيقين، ومكتبات مشتركة» / “Two applications, shared libraries.” Highlight actual imports. |
| Startup | 20–25s | package.json dev → nx.json Vite plugin → Vite config → index.html → main.tsx | «الكوماند بيوصل لـReact إزاي؟» / “From command to React.” If demonstrating actual startup, use approved existing-server handling; no fake terminal output. |
| Invoice journey | 25–35s | shared/index.ts seed fixture/total → App listInvoices state → InvoiceTable link → real INV-2026-1048 details | «الداتا ثابتة، العرض بيتغير» / “Business data stays canonical.” Show quantity1 ×4800, correct customer and route. |
| Shared consumer | 15–20s | Procurement App Orders/DataTable + shared order fixture; real list/detail in browser | «نفس المكونات في المشتريات» / “Shared components, second consumer.” No invented create-order page. |
| Language owner | 20–25s | Real selector from demo English URL to Arabic; i18n setLanguage/useLayoutEffect beside matching source navigation | «اللغة جاية من الـURL» / “Locale follows the URL.” Plain / has no selector: use ?demo=unmigrated-rtl&lang=en. |
| Runtime boundary | 20–30s | Study main/provider source; read reference with git show HEAD:... without switching commits | «المستند RTL، بس MUI لسه LTR» / “Document RTL; MUI still LTR.” Highlight actual ThemeProvider and absent active RTL CacheProvider. |
| Discovery output | 20–25s | Run rebuilt scanner --format summary in real terminal; show INCOMPLETE and Codemod dry-run refusal | «دي مخاطر وتحليل غير مكتمل، مش 58 bug مؤكدة» / “Static risks; incomplete analysis, not 58 confirmed bugs.” Keep exit2 honest. |
| Review boundary | 5–10s | Remain on real code/terminal; minimal attached callout | «نراجع قبل التنفيذ» / “Review before implementation.” No fabricated green test suite. |

## Nx visualization decision

Actual exported graph JSON exists at /private/tmp/scene03-project-graph.json with five nodes and no edges. If used, explicitly show that limitation. Prefer navigating actual imports until separately approved graph investigation establishes the missing edges. No manufactured connected architecture graphic is presented as Nx evidence.

## Visual and localization direction

Preserve approved Scene02 full-screen 1920×1080 developer experience. Smooth restrained zooms around actual source lines and UI; keep relevant context legible. Attach brief red/white labels to affected elements only when backed by runtime evidence. Use subtle connectors only where needed, no bottom caption band, floating screenshot, presentation background or slide interludes. English source remains unchanged. Arabic callouts must be visually checked for mixed-direction rendering; use consistent English technical names. Prepare separate AR/EN narration plans only after review.

Cursor movement should follow actual actions. Attention sound may accompany a verified highlight, never mask a failed command. Do not turn an incomplete Scanner result into a successful animation. Existing V4 footage remains untouched and is not silently repurposed as freshly recorded Scene03 evidence.

## Pre-recording approval checklist

Confirm exact Study diff and reference identity, agreed browser/profile/origin, existing dev-server handling, fixture storage state, capture resolution/readability, selected code lines, and honest command results. Approve the story and duration before recording. Full E2E/protection success cannot be claimed from this Study state. No UI fix, policy refresh, baseline rewrite, commit or push is part of this proposal.
