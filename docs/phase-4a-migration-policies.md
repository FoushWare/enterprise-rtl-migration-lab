# Stage 4A — Proposed RTL migration policies

Project: **Migrating Enterprise React Apps to RTL Without Breaking LTR**. Stage 4A planning only, 12 October 2026. Branch `feat/phase-3-rtl-scanner`, clean starting HEAD `0de6d609cbfb9aae662d1cb7c9589c38592bb21b`. Recommendations are not authorization. No source, policy, runtime, tests, dependencies or baselines are changed.

## Status and decision authority

All policies below are proposals. Phase 2A documented reading-start navigation, intact Latin branding and physical LTR chart chronology as intended conventions; that does not authorize implementing them now. No semantic policy entry or exception is added. Preserve canonical records, routing identities, translations and approved English defaults. Recommend retaining the historical Unmigrated RTL demo for before comparisons and a separate future migrated-preview mode, whose URL/UI must be approved before changing runtime behavior; no such mode exists today.

## Logical CSS and intentional geometry

| Surface | Proposed policy | Why a syntactic conversion is insufficient |
| --- | --- | --- |
| margin/padding left/right | Use inline-start/end only for approved reading-flow relationships under horizontal writing mode. | A Latin direction island, chart frame or physical boundary may need the original side. React numbers are px; sx numbers are theme spacing. |
| Borders | Navigation active border may become reading-start only with paired padding and shell policy; separator edge depends on neighboring children. | Border-left and padding-left currently compensate one another; replacing one alone changes box geometry. |
| Corners/radii | Map named corners to start-start/start-end/end-start/end-end only after writing-mode/shape review. Tokenize slash/elliptical shorthands without splitting functions. | Top-left is physical; logical block/inline corner meaning depends on writing mode. Symmetric circles need no edit. No current asymmetric corner defect is invented. |
| Position left/right | Use inset-inline-start/end only when the containing-block and placement contract is approved. | Sidebar anchor/gutter/transform must move together; KPI/dialog clearance is independent of property spelling. |
| Flex | Default row already follows direction; preserve semantic DOM and keyboard order. | Adding row-reverse can reverse twice or disconnect focus and visual order. flex-end is not a synonym for physical right. |
| Grid | Preserve dataset/DOM order; review explicit line numbers/named areas separately. | 1/-1 full span is nondirectional. RTL line numbering and asymmetric track order are geometric decisions. |
| Text alignment | Start/end for human reading alignment; explicit numeric/token policies independent of bidi run direction. | Right-aligning every table cell can contradict amount conventions and English baseline. |
| Shorthands | Preserve symmetric values; map only reviewed asymmetric sides and cascade. | Expanding shorthand can reset unrelated subproperties or change override precedence/important behavior. |
| Transforms/animations | Manually approve motion origin/end/sign; no blanket negative-number reversal. | Drawer translateX(-100%) is tied to left anchor. No current directional keyframe findings; future keyframes require temporal/geometry review. |
| CSS custom properties | Establish definition/use/fallback chains and semantic unit before rewriting consumers. | --offset could be coordinates or inline spacing. None found in supported app/lib scope; scanner lacks a full cascade/variable solver. |
| Cascade/specificity | Preserve selectors/media/print/order/important; remove obsolete companion physical properties in one reviewed patch. | Physical and logical declarations can compete for the same computed side. Do not add fallback layers that leave a stale opposite margin. |

Intentional physical cases proposed: chart axis gutter inside a fixed LTR time frame, Latin brand internal composition, canonical coordinate/numeric conventions. These are not blanket scanner suppressions. Brand outer placement still belongs to Arabic navigation; token direction does not justify physically left-aligning its parent.

## MUI + Emotion runtime proposal

Installed source/package facts: MUI 7.3.11, Emotion react/cache 11.14.0, styled 11.14.1, Stylis 4.2.0. Cache/Stylis are transitive, not direct runtime dependencies; neither RTL plugin package is installed. No custom CacheProvider exists in inspected sources. Current Provider is outside BrowserRouter/LocaleProvider in both main.tsx, so it cannot read the locale context today.

MUI's v7 guidance separates document direction, theme direction and Emotion RTL processing; body portals require correct global direction or explicit local propagation. [MUI v7 RTL setup](https://v7.mui.com/material-ui/customization/right-to-left/). Emotion custom plugin lists need an explicit prefixer, and distinct caches need distinct keys. [Emotion cache reference](https://emotion.sh/docs/@emotion/cache).

**Proposed project design (inference requiring approval):** keep one shared mode/direction source, place the locale/mode reader above the direction-aware theme/cache boundary inside the router, and keep App/forms mounted. Preserve palette, typography and overrides. Maintain stable LTR/RTL themes and caches, with distinct insertion keys and identical reviewed insertion precedence; LTR prefixer-only and RTL prefixer then compatible RTL plugin. Investigate/pin direct @emotion/cache, stylis and @mui/stylis-plugin-rtl only in Stage 4D after compatibility/dependency approval. Never infer availability from transitive installation. No install occurs now.

Synchronize root lang/dir, selected theme and cache on first paint and every switch; use no subtree key that remounts business state. Validate stale style tags/order and repeated switching, not just first Arabic load. Global root covers normal body portals, as Phase 2A already measured; explicit portal dir is needed for future local direction islands, not a fabricated global portal workaround. Keep generated TextField, Dialog, Menu and Pagination under the same runtime contract.

**Critical transition boundary:** RTL plugin activation can flip custom SidebarFrame left/border/translate while plain CSS .app-main gutter remains left. Stage 4D must temporarily preserve the legacy shell anchor/motion under a verified plugin opt-out, or include a separately approved atomic shell patch; recommendation is opt-out until Stage 4E. Do not change cache alone and ship mismatched geometry. Plugin opt-out comment handling for template literals and custom object overrides must be fixture/browser-proved. Nested cache scoping is an alternative only after proving MUI child styles retain the right cache; not a default workaround.

One owner per directional effect: plain CSS/inline → reviewed logical/manual semantics; generated MUI physical CSS → active RTL processing; custom Emotion/sx → explicitly assigned logical or plugin-physical contract. Do not hand-swap a plugin-owned right/left declaration and also let the plugin reverse it. Logical properties are not themselves “flipped twice,” but mixing physical plugin output with logical/manual companions can duplicate or conflict. No guarantee that noflip metadata works for every sx object representation. Modal close sx may naturally change under the plugin: inspect before adding a second manual mirror. MUI theme direction alone does not rewrite TableCell's installed physical textAlign:left defaults.

## Icons and navigation

Propose direction-aware visual progression for invoice row ArrowForward, view-all literal arrow (Arabic dictionary currently retains →) and cross-app arrow. Keep actual routes/page identity and DOM focus order. Let MUI Pagination supply its own theme-dependent previous/next roles before touching icons. Directional chevrons/back/forward mirror only if they denote reading/navigation progression; disclosure-down, Close, Menu, Search, receipts, wallet, clock, notifications and shopping glyphs preserve semantics. TrendingUp, ↗ growth and external-link conventions retain orientation pending their own semantic review. Latin logos never mirror glyphs. No global SVG scaleX(-1).

## Charts/data — RTL-02

Propose keeping May→October physical left-to-right with fixed SVG coordinates and unchanged illustrative data. Current month source array is May..Oct, but inherited RTL flex puts May at the high right-hand October endpoint. Preserve sequence and frame; establish an explicit LTR chart-coordinate/label-layout region with individually Arabic-aware labels. Do not reverse the dataset or mirror SVG text. The 40px left label gutter is an axis contract, not automatic padding-inline-start. Recheck label positions against plot area rather than assume space-between provides exact point alignment. Numeric meaning, endpoint, dataset identity and translated accessible description remain consistent. No tooltip exists in this static SVG: preserve meaning if one is added later, without inventing a current tooltip defect. Donut angular proportions/status order stay unchanged absent product evidence.

## Bidirectional content

Use content boundaries rather than reversing strings. Known invoice/order IDs, email/IBAN-like values and established Latin tokens: consider an isolated LTR run, e.g. bdi with explicit ltr, within an Arabic reading container. IBAN is a future policy example, not a detected current field. Unknown user/company/product text: bdi/dir=auto according to the first strong character; leading digits alone do not determine intended human direction. Avoid blanket LTR for names or mixed paragraphs. Where markup is unavailable, unicode-bidi:isolate with an appropriate direction is a reviewed fallback; avoid embed/override and hidden controls in stored data. [W3C inline bidi guidance](https://www.w3.org/International/articles/inline-bidi-markup/).

Currency: preserve current en-US display/canonical value in this migration unless locale policy separately approved; isolate the entire formatted amount in mixed Arabic sentences, never currency symbol separately. Dates: preserve ISO storage and local/native display contracts; inspect date input segments, caret and browser locale before policy changes. Emails/IDs: visual selection and copied string must retain exact code-point order and route matching. Latin product names are token islands only when their identity requires it; translated explanatory text remains Arabic. Surrounding punctuation belongs to the sentence or token deliberately. Seventeen unresolved bidi candidates still need runtime/content evidence; their source alone cannot prove a failure.

## Branding — RTL-09

Propose the complete symbol + atlas + period as one LTR composition, with unchanged Latin letter shapes and child order; surrounding sidebar remains Arabic/reading-start. Review internal brand-mark margin separately from outer brand margin. Branding direction island is manual semantic policy, not a regex exception for every Latin string. No branding exception is approved in current policy.

## Preview/before-mode decision requiring approval

Retaining a live unchanged Unmigrated RTL mode alongside a migrated preview requires scoped new CSS/runtime behavior or a separate checkout/server for the approved before checkpoint. Shared CSS pilot edits alone affect both live modes; archived screenshots preserve history but cannot freeze the current runtime. Recommend a separate before-checkpoint server for video comparisons and a distinct migrated-preview flag in the working app, subject to explicit approval. If the reviewer instead requires both modes in one runtime, Stage 4C/D must approve mode-scoped styles/providers and the resulting expanded pilot diff. Do not promise unchanged live before-mode geometry from a global three-property edit. English defaults and protected documentary bytes remain unconditional requirements.
