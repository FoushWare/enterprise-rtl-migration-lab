# Scene 01 V3 — Cinematic geographic journey, Europe → Middle East

**Draft — Pending Review.** Two silent20s previews only. No production application, policy, test, repository history, Scene02 footage or earlier Scene01 output changed.

## Actual redesign

Rebuilt camera position AND look-target keyframes for closer oblique geography; reduced night-light overexposure and atmosphere strength; replaced three early destinations with Cairo/Riyadh only; rebuilt elevated curved routes, pins and projected anchored label system. Origin establishes during0–10; decisive southeast travel begins10.5; Cairo arrives13.2, Riyadh14.8; regional title enters15.2 and remains through20. Camera settles18, leaving2s stable ending. Smooth quintic interpolation changes orbit, distance and orientation without cuts. No arbitrary image-pan replacement.

Native HTML text is projected from actual 3D location anchors into screen coordinates each frame, with fine pin connectors. DOM text is overlaid as scene labels, not a bottom subtitle band. Earth UV/geometry never mirrors. AR uses explicit RTL and native Chrome Arabic shaping; EN uses LTR. Source geometry, lighting and camera inputs are identical. Four labels only: Europe/Egypt/Saudi Arabia/Middle East and their Arabic equivalents.

## Sources and reproducible workflow

- `source/scene.js`: Three.js scene, material shaders, geodesic routes, new markers, geographic label projection and deterministic frame seeking.
- `source/timing.json`: editable camera/geography/reveal/narration schedule. Latitudes/longitudes are degrees; sphere radius2.
- `source/index.html`: localized label typography/style. AR34px country and58px region; EN30px and52px. Country/region sizing differs intentionally for readable native scripts.
- `source/render.mjs`: headless Chrome screenshot frames→FFmpeg H.264; captures frame-by-frame camera/label audits and representative PNGs.
- `timeline/CAMERA_NARRATION_TIMELINE.md`: exact supplied Egyptian Arabic sentences, estimated phrases, camera keyframes, per-second hears/sees, entrances, presenter boundary and transitions.
- `timeline/NARRATION_GUIDE.srt`: separate editable estimated narration timing, never burned into preview.
- `timeline/STORYBOARD_COMPARISON.md`: before/after differences written before implementation, plus fidelity boundaries.
- `outputs/frame-*.png`: representative full-resolution render frames, contact sheets and validation artifacts.

From repository root, using existing dependencies:

```sh
node assets/scene-01-opening-v3/source/render.mjs --preview --ar
node assets/scene-01-opening-v3/source/render.mjs --preview
node assets/scene-01-opening-v3/source/render.mjs --ar
node assets/scene-01-opening-v3/source/render.mjs
```

Full export refuses overwrite. Preview frames may be refreshed within this new draft folder only. Reuse pinned Three.js0.170.0, prior Earth textures and existing Playwright/Chrome/FFmpeg; no install. Vendor/textures are relative links into sibling V1; retain sibling folder for portability. See V1 README and bundled license for provenance. Scene is viewable with a local HTTP server serving source/, and loops20s unless `?render` is set. `?lang=ar` selects Arabic.

## Timing and authenticity

No real narration was recorded or synthesized. Phrase timings remain estimates; title entry follows estimated الشرق الأوسط onset14.8. Country names are visual destination annotations, not invented voiceover text. Later Scene01, presenter, remaining scripts and nine-scene production remain unapproved/unrendered. This is an explicitly fictional company with geographic city anchors, not customer-office evidence.

## Fidelity and limitations

Implemented storyboard elements: night Earth, Europe origin, oblique regional travel, two curved blue arcs, sequential markers, localized geographic labels, regional title hierarchy and steady final network. Not a pixel copy: no office building model, no country-boundary claim, no fake app UI or presenter. Existing day/night textures are2048px and limit very close terrain detail; no new satellite-detail fidelity is claimed. The camera remains an orbital geographic visualization rather than a low-altitude fly-through. AR shaping checked visually in representative frames; all-frame geometry audit complements but does not replace visual review. See verification receipt for exact pass/fail checks.

## Approval boundary

Review both actual previews and contact sheets. Successful encoding does not equal creative approval. Stop after this0–20s geographic sequence; no remainingScene01 render is authorized automatically.
