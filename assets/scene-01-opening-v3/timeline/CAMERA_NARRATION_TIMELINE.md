# Scene 01 — Geographic journey V3, narration-first timeline

Draft — Pending Review. 1920×1080/30fps/20s; frames0–599. Timings are ESTIMATED, not measured speech alignment. No synthetic voice, no presenter. Source timing.json is the authoritative editable camera/event schedule. End frames exclusive.

## Shot structure

| Shot | Time / frames | Exact Egyptian Arabic narration | Spoken estimate | Visual and camera | Geographic labels | Transition |
|---|---|---|---|---|---|---|
|A:Europe|0–10 /0–300|تخيل معايا شركة Software كبيرة في أوروبا، عندها Enterprise Platform شغالة بالفعل.|0.4–8.4, about8s with clause pause|Stable identifiable Europe, slow oblique push/orbit, HQ emerges3.0–3.65|أوروبا / Europe3.0–20|Continuous pose hold9.8–10.5; no cut|
|B:departure|10–13.2 /300–396|الشركة دي قررت تتوسع في سوق جديد...|10.4–13.5, about3.1s|Camera physically travels southeast; Europe→Cairo arc grows11.0–13.2; second route starts12.4|Origin remains linked to HQ|Camera eases at Cairo approach|
|C:Egypt|13.2–14.8 /396–444|Natural pause, then start of the region phrase at14.8|Pause13.5–14.8|Cairo pin illuminates on route arrival13.2; camera proceeds toward Arabia|مصر / Egypt13.2–20|Continuous motion, no hard cut|
|D:Saudi|14.8–15.2 /444–456|الشرق الأوسط (continues)|Region phrase14.8–16.8, about2s|Riyadh pin illuminates on second route arrival14.8|السعودية / Saudi Arabia14.8–20|Gently widen toward network composition|
|E:regional reveal|15.2–20 /456–600|الشرق الأوسط (ends16.8), then breathing/hold|Remaining phrase through16.8|Title fades15.2–16.0; camera settles18; final2s steady|الشرق الأوسط / Middle East above/between destinations15.2–20|Transition-ready hold; product shot not rendered|

Narration sentences are unchanged. Egypt/Saudi are visual geographic anchors, not newly invented spoken words. Geographic labels are scene elements, not subtitles. Europe enters with the estimated Europe phrase; regional title never appears before the region phrase. Country names enter on route arrivals under the expansion sentence.

## Explicit camera keyframes

Camera position = geographic lat/lon at given world radius. Camera orientation changes by looking at the separate geographic target, not by moving labels. World sphere radius2; up axis+north Y. Interpolate camera/target parameters with quintic smootherstep, providing zero velocity/acceleration at the intentional arrival/hold boundaries.

|Time|Frame|Camera lat/lon/radius|Target lat/lon/radius|
|---|---|---|---|
|0|0|63, -4, 4.2|44, 16, 1.4|
|9.8|294|61, 1, 4.05|44, 17, 1.4|
|10.5|315|61, 1, 4.05|44, 17, 1.4|
|13.2|396|48, 20, 4.0|34, 29, 1.4|
|15.5|465|42, 32, 4.2|29, 38, 1.3|
|18|540|45, 25, 4.6|34, 31, 1.25|
|20|600|45, 25, 4.6|34, 31, 1.25|

## Audience hears/sees each second

The supplied MP4 is silent; “hears” means the intended future real performance. Approximate phrase splits below must be realigned after the creator records. Do not speed up speech to meet estimates. No subtitles are burned; geographic labels remain integral to AR/EN scene versions.

|Second / frames|Intended narration fragment|Action|
|---|---|---|
|0–1s /0–29|تخيل معايا (starts0.4)|Oblique Europe; slow establishing motion.|
|1–2s /30–59|تخيل معايا / شركة Software|Europe recognizable, no destinations.|
|2–3s /60–89|شركة Software|Camera continues restrained push.|
|3–4s /90–119|كبيرة في أوروبا|HQ+Europe label fade from3.0.|
|4–5s /120–149|في أوروبا / pause|Hold European origin, label anchored above pin.|
|5–6s /150–179|عندها / Enterprise Platform|Show established origin, no expansion arcs.|
|6–7s /180–209|Enterprise Platform|Europe stays readable.|
|7–8s /210–239|شغالة بالفعل|Stable headquarters context.|
|8–9s /240–269|بالفعل ends8.4|Breathing room; no regional title.|
|9–10s /270–299|silence|Camera settles9.8; prepare travel.|
|10–11s /300–329|الشركة دي starts10.4|Decisive travel begins10.5.|
|11–12s /330–359|قررت تتوسع|Cairo route begins11.0.|
|12–13s /360–389|في سوق جديد|Camera travels; Saudi route starts12.4.|
|13–14s /390–419|جديد / pause|Cairo route ends/pin+label starts13.2.|
|14–15s /420–449|pause / الشرق starts14.8|Riyadh route ends/pin+label14.8.|
|15–16s /450–479|الشرق الأوسط|Regional title begins15.2; wider composition.|
|16–17s /480–509|الأوسط ends16.8|Title full opacity16.0, country labels readable.|
|17–18s /510–539|silence|Camera gently widens; all destinations visible.|
|18–19s /540–569|silence|Steady final frame composition.|
|19–20s /570–599|silence|Hold; transition out is not rendered.|

## Separate text tracks and future work

NARRATION_GUIDE.srt is an editable future-voice timing guide only; it is not burned into these previews. No final subtitles exist. Native browser layout shapes Arabic geographically anchored text without mirroring the globe; EN differs only in labels and typography. No presenter placeholder is rendered in0–20. Remaining Scene01 and scripts02–09 remain pending approval. Earlier proposed52s fullScene01 remains a draft; this task does not approve or render it. Final alignment requires the real Egyptian Arabic recording, with word/phrase onsets adjusted to actual delivery and subsequent camera/title timings shifted accordingly.
