# Real RTL developer demo — Draft / Pending Live Overlay Validation

Date: 2026-10-25. This is an execution receipt and recording guide, not a video.

## Workspace and actual execution

- Workspace: `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`
- Branch: `study/unmigrated-rtl-ui`
- HEAD: `910133cc332af96268d19fc6563608434b2c321c`
- VS Code native accessibility/control worked. Both servers were started in its integrated terminals, not in another checkout.
- Invoicing: `npm run dev`; Procurement, second terminal: `npm run dev:procurement`.
- Both servers returned HTTP 200 and remain running. The old Invoicing process was deliberately interrupted before restarting it; its interrupted Nx message is not a failed application build.
- Existing tracked UI restoration changes and the user's `nx.json` change were preserved. No commit, push, source fix, policy, pin, baseline or release operation was performed.
- Existing `docs/video-demo-guide.md` was inspected before creating a helper. It describes the original English-only recording and has no live annotation implementation. It was not edited.

## Actual browser sequence

1. Opened `http://127.0.0.1:4200/` in the real in-app browser; visually inspected English LTR.
2. The plain root does not expose the language control. Opened `http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en` to enable the existing opt-in demo, still in English.
3. Selected `ar` with the real `Language / اللغة` native select. Verified URL `lang=ar`, document `dir=rtl`, and Arabic interface text. No direct Arabic navigation substituted for this test.
4. Inspected sidebar, logo and KPI cards. Clicked `الفواتير`, then `إنشاء فاتورة`. Inspected form labels and select arrows without submitting.
5. Clicked `العملاء`, clicked the first `عرض العميل`, inspected Northstar Studio dialog, then clicked `إغلاق النافذة`.
6. Clicked the real `المشتريات` cross-application link. It intentionally navigates to `http://localhost:4201/?demo=unmigrated-rtl&lang=ar` (hostname is defined by existing application navigation).
7. Inspected Arabic table headings and the Invoicing navigation arrow. Selected `en` using the same actual language selector; visually verified English LTR, then clicked `Invoicing`.
8. Repeated the actual English-to-Arabic selector change on Overview and scrolled to inspect the chart. Current retained in-app tab is the Arabic overview.

The screenshots are new real browser/VS Code captures. They do not replace historical evidence. Browser layout was 1280×720 CSS pixels (scrollbar-dependent captured image width); native VS Code captures are 3330×2040. No claim of mobile or exhaustive viewport testing is made.

## Verified issue inventory

| ID | Actual selector / location | Observation this session | Source mapping |
| --- | --- | --- | --- |
| RTL-01 | `aside` | Arabic document, sidebar x=0, width=238. Physical left position stays unchanged. | `libs/design-system/src/index.tsx:204`, SidebarFrame, `left: 0` at 206; `styles.css:114` reserves margin-left. |
| RTL-02 | `.chart-wrap`, `.chart-labels span` | May x=1190.27, October x=684.04, while SVG curve still rises left-to-right. Labels reverse independently of unchanged illustrative chart. | `apps/invoicing/src/pages/Dashboard.tsx:103–150`, SVG and month rendering; `libs/design-system/src/styles.css:282` inherited RTL flex flow. |
| RTL-03 | `.kpi:has(.kpi-icon)`, `.kpi-label`, `.kpi-icon` | Four Arabic text-range bounds overlap their icons; visible label obstruction. | `libs/design-system/src/styles.css:239`, absolute icon `right:20px` at 241. |
| RTL-04 | `.MuiFormControl-root`, `.MuiInputLabel-root`, `.MuiSelect-icon` | Arabic labels/notches stay on left; icons on right. Readback label left=0, translateX(14); select icon right=7px. | `libs/design-system/src/runtime.tsx:6`, LTR theme; Provider at 78 always selects it. Not an application validation defect. |
| RTL-05 | `.MuiDialogTitle-root`, `[role="dialog"] button` | Settled Northstar Studio title visibly intersects close glyph at right. | Shared Modal in `libs/design-system/src/index.tsx:125–135`, `right:12` at 131. |
| RTL-06 | `thead th` | All five Procurement Arabic headers report `text-align:left`, visible in screenshot. | DataTable `libs/design-system/src/index.tsx:166`; LTR MUI runtime. |
| RTL-07 | `.app-link svg:last-child` | Right-pointing navigation arrow remains unmirrored in Arabic. This is a directional consistency observation against RTL reading flow, not a broken route. Real navigation succeeded. | `libs/design-system/src/index.tsx:298`, unconditional ArrowForward. |
| RTL-08 | `[role="dialog"] .hint` | Logical address starts `24 Alder Street…`; rendered Arabic-context line places 24 at the visual end. Also `.Evergreen & Co` punctuation visible on customer card. Email itself was not claimed broken. | `apps/invoicing/src/pages/Customers.tsx:60`, raw address under inherited RTL without isolation. |
| RTL-09 | `.brand` | Mark moves to the right and period to left in Arabic, compared with English brand composition. | `libs/design-system/src/index.tsx:246` brand markup; `styles.css:15–37` flex row and physical spacing. |

These are observed presentation problems in the intentionally unmigrated study UI. They are not nine newly confirmed scanner rules or business-logic defects. Exact source lines are local worktree locations, not immutable release line mappings.

## Live overlay — implementation and honest limitation

`rtl-overlay.js` is a self-contained helper. It creates only a temporary shadow-root annotation layer, reads actual `getBoundingClientRect()` bounds, has pointer-events disabled and exposes show/hide/destroy. It does not change existing elements, application CSS, data, focus or route state. It runs only on localhost/127.0.0.1 ports 4200/4201 and only displays issue boxes for an RTL document. Missing/offscreen targets produce no box. It is not automatic issue detection: choose an issue only on the page verified above.

**Validation status:** JavaScript syntax checked. Live red rectangles, keyboard handling and click-through behavior have NOT yet been verified in this session. In-app browser evaluation is read-only. Native Brave was available, but its DevTools security warning blocked paste. No warning was bypassed. User handoff was requested. Do not present the overlay as validated until the live check below succeeds.

After personally reviewing the helper and handling any browser security warning yourself, load it from the real application's DevTools Console using `load-overlay.js` (copy its contents). No new server or mock application is required. Vite serves the study-local helper from its existing workspace. Close DevTools before recording.

Shortcuts after successful load:

- Alt+Shift+1 … Alt+Shift+9: show the corresponding issue, replacing the previous one.
- Alt+Shift+0 or Escape: hide.
- Alt+Shift+X: completely remove layer and event listener.
- Console API: `window.__rtlDemo.show(1)`, `.hide()`, `.destroy()`.

On macOS, shortcuts use physical number-key codes so Option-generated characters do not break selection. A full reload or cross-application document navigation removes the helper; load it again on the new document. SPA route navigation preserves it; hide before moving pages. Do not change browser security settings as part of this workflow.

Pending live acceptance sequence: show 1 → screenshot → 0 → show 9 → screenshot → 0 → show 3 → screenshot → scroll/chart/show 2 → screenshot → 0 → form/show 4 → screenshot → 0 → customer dialog/show 5 then 8 with separate screenshots → 0 → Procurement/reload helper/show 6 then 7 separately → hide → switch English → confirm no red labels → destroy. Confirm normal navigation clicks still work with a box visible, and that no overlay DOM remains after destroy.

## Actual source demonstration in VS Code

Used Quick Open to open `libs/design-system/src/index.tsx:205`, then selected the actual `left: 0;` at line 206. Opened `libs/design-system/src/styles.css:241`, selected `right: 20px;`, and hid the terminal panel to improve readability. Native screenshots record both actions. No source text was typed into the editor. Other mappings above were inspected through filesystem reads; they were not all opened in VS Code.

To reproduce: Cmd+P → paste `libs/design-system/src/index.tsx:206` → Enter after the result appears. For KPI use `libs/design-system/src/styles.css:241`; for Modal use `libs/design-system/src/index.tsx:131`. Select the property using Home/Shift+End (or macOS Cmd+Left, Cmd+Shift+Right). Do not type a replacement.

## Evidence files

- `evidence/01-overview-en.jpg`: real English overview, full page.
- `evidence/02-overview-ar.jpg`: real Arabic overview, full page.
- `evidence/03-chart-ar.jpg`: actual scrolled chart, month mismatch, sidebar and table context.
- `evidence/04-form-ar.jpg`: unsubmitted Create Invoice form.
- `evidence/05-dialog-ar.jpg`: settled customer dialog and address.
- `evidence/06-procurement-ar.jpg`: Arabic Procurement table and navigation.
- `evidence/07-procurement-en.jpg`: English after actual selector change.
- `evidence/08-code-sidebar.jpg`: actual VS Code sidebar property selected; Procurement terminal ready.
- `evidence/09-code-kpi.jpg`: actual VS Code KPI property selected.
- `evidence/observations.json`: live DOM geometry receipt from Arabic overview.

**No screenshot in this set contains a working red overlay. No video or OBS recording was made.**

## Egyptian Arabic narration outline

1. «ده التطبيق الإنجليزي الحقيقي. الفواتير والأرقام شغالة، وهنغيّر لغة العرض بس.»
2. «اخترنا العربي من القائمة. اتجاه الصفحة اتغير، بس الشريط الجانبي لسه مربوط بالشمال بـ left: 0.»
3. «الأيقونة ثابتة يمين، والعنوان العربي بيبدأ يمين، فبقوا داخلين على بعض. هنا الكود المسؤول: right: 20px.»
4. «الرسم نفسه ما اتغيرش، لكن أسماء الشهور اتعكست لوحدها. تغيير الاتجاه مش معناه نقلب كل حاجة.»
5. «الفورم والنافذة بيورّونا إن اتجاه المستند لوحده مش كفاية لإعدادات MUI؛ وزر الإغلاق داخل على اسم العميل.»
6. «نفس المكوّنات المشتركة مستخدمة في المشتريات: عناوين الجدول لسه شمال، والسهم لسه يمين.»
7. «رقم العنوان موجود صح في البيانات، لكن ترتيب عرضه اتغير في سياق عربي. لازم نفصل سلامة البيانات عن طريقة العرض.»
8. «رجعنا للإنجليزي من نفس القائمة. في الخطوة دي بنوثّق المشاكل بس؛ ما أصلحناش حاجة.»

## Recommended OBS sequence (not executed)

Use a browser Window Capture and a separate VS Code Window Capture; 1920×1080 canvas, 30 FPS. Do not stretch screenshots to pretend they are live footage. Set up a readable browser window before recording and use real native UI for navigation. Record English overview → actual selector switch → one issue at a time (show, pause, hide) → VS Code property → browser → form/dialog → Procurement → English. Keep labels away from the problem and cursor movement slow. Capture several short takes rather than one long recording. Do not include DevTools loader/security setup in the final presentation. Review a short recording for legibility before a full video.

## Remaining limitation

Browser security handoff is still required to validate the overlay live. The guide and helper are review drafts. All other described navigation, language switching, screenshots and two source selections were actually executed. No release, branch, application or historical asset was changed for the helper.
