# Coffee Break Web — ChatGPT Video Review Package

Generated from existing assets only. No source video was re-encoded or modified.

## A. Selected Videos

| Video | Duration | Size | Resolution / FPS | Audio | Source Path |
|---|---:|---:|---|---|---|
| `Scene-01_Business-Expansion_AR_V5_Clean.mp4` | 50.000s | 10.62 MB | 1920×1080 / 30fps | AAC stereo | `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/scene-01-v5/outputs/Scene-01_Business-Expansion_AR_V5_Clean.mp4` |
| `Scene-02_Broken-RTL_AR_V5_Clean.mp4` | 134.000s | 6.39 MB | 1920×1080 / 30fps | AAC stereo | `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/scene02/outputs/Scene-02_Broken-RTL_AR_V5_Clean.mp4` |
| `Scene-03_Architecture_AR_V2_Clean.mp4` | 130.000s | 37.65 MB | 1920×1080 / 30fps | AAC stereo | `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/scene-03-v2/outputs/Scene-03_Architecture_AR_V2_Clean.mp4` |
| `scanner-flow-poc.mp4` | 22.500s | 5.20 MB | 1920×1080 / 30fps | No audio | `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/video-assets/scanner-poc/scanner-flow-poc.mp4` |
| `runtime-direction-demo.mp4` | 59.667s | 3.02 MB | 1920×1080 / 30fps | AAC mono | `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/video-assets/runtime-direction-poc/runtime-direction-demo.mp4` |
| `CoffeeBreakWeb_RTL-Migration_AR_Master_V1_Clean.mp4` | 184.021s | 17.01 MB | 1920×1080 / 30fps | AAC stereo | `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/master/outputs/CoffeeBreakWeb_RTL-Migration_AR_Master_V1_Clean.mp4` |

Language is inferred from filenames and production documentation. Audio language was not independently auditioned.

## B. Copied Files

Destination directory:

`/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/review-package/chatgpt-video-review/videos/`

All six files were copied, not moved. SHA-256 comparison against the originals passed:

| Filename | SHA-256 | Checksum |
|---|---|---|
| `Scene-01_Business-Expansion_AR_V5_Clean.mp4` | `62ddcbec806050ef6b21a5c2a4e7a30bd6622dd5f07af5f46ca1fb2539a962a9` | PASS |
| `Scene-02_Broken-RTL_AR_V5_Clean.mp4` | `2a8d992f8720e5bdc42e91a45917b93a54e6ce8ebbedf38eeca24dd6d06ef4b9` | PASS |
| `Scene-03_Architecture_AR_V2_Clean.mp4` | `69237b685814fb4598b2c38d87cdfe25f4083ff52dcf7e10ffd35c44740e9f56` | PASS |
| `scanner-flow-poc.mp4` | `30dd1ed8393e0ecba2db2cf54f2f11bf3bbbe6c094d220285fcfbf2729f2570d` | PASS |
| `runtime-direction-demo.mp4` | `7660205aa861f9e7c8d9517f8b1368783087ed5aa799c3825a19ec6adfbaa854` | PASS |
| `CoffeeBreakWeb_RTL-Migration_AR_Master_V1_Clean.mp4` | `b23a3aa07b10c04c038253187eae6fc54c3667ac961d8c720828a3ed367288cd` | PASS |

## C. Contact Sheets

Each contact sheet is a newly generated JPEG containing ten evenly distributed frames with visible timestamps:

- `contact-sheets/Scene-01_Business-Expansion_AR_V5_Clean.jpg`
- `contact-sheets/Scene-02_Broken-RTL_AR_V5_Clean.jpg`
- `contact-sheets/Scene-03_Architecture_AR_V2_Clean.jpg`
- `contact-sheets/scanner-flow-poc.jpg`
- `contact-sheets/runtime-direction-demo.jpg`
- `contact-sheets/CoffeeBreakWeb_RTL-Migration_AR_Master_V1_Clean.jpg`

## D. Language Reusability

| Video | AR/EN Reusable | Localization Needed | Notes |
|---|---|---|---|
| Scene 01 AR V5 Clean | Likely, with review | EN voice, captions, localized graphics | Same core visual edit has documented AR/EN counterparts under `assets/scene-01-v5/outputs/`. |
| Scene 02 AR V5 Clean | Likely, with review | EN voice/captions | Documented AR/EN Clean/Preview counterparts exist; this selected file may contain language-specific narration/audio. |
| Scene 03 AR V2 Clean | Likely, with review | EN voice/captions | AR/EN V2 outputs and voiceover guides exist. |
| Scanner Flow POC | Mostly language-neutral visuals | Optional captions/narration | Real VS Code and scanner report footage; lower-thirds may require localization. |
| Runtime Direction Demo | Mixed | Audio/subtitle localization | Contains Arabic narration materials and code/report visuals. |
| Arabic Master V1 Clean | No, not directly | English master required | It is an Arabic-language master; it contains Scene 01 and Scene 02 source footage. |

## E. Duplicate Footage

- The Arabic master definitely overlaps with Scene 01 and Scene 02: `Master-Video-Scene-Manifest.md` specifies Scene 01 from 0–50s and Scene 02 from 50–184s.
- `Scene-01_Business-Expansion_AR_V5_Clean.mp4` and the corresponding section of the Arabic master are therefore not independent footage.
- `Scene-02_Broken-RTL_AR_V5_Clean.mp4` and the corresponding master section are likewise not independent.
- Scanner POC and Scene 03 both explain scanner architecture/reporting concepts, but no confirmed frame-level duplicate was established.
- Runtime Direction Demo and Scene 03 both contain scanner/code architecture material; overlap is conceptual and possible, not confirmed as identical footage.
- No files were deleted or deduplicated.

## F. RTL Analyzer v3 Coverage

| Feature | Existing Footage | Missing Footage |
|---|---|---|
| Analyzer Dashboard | Not confirmed in selected videos | Dedicated dashboard recording |
| RTL Findings | Scanner POC shows a real scanner finding, not the v3 dashboard | Full findings dashboard |
| Automated Recommendations | Not confirmed | UI recording |
| Assisted Recommendations | Not confirmed | UI recording |
| Manual Recommendations | Not confirmed | UI recording |
| Developer Decisions | Not confirmed | UI recording |
| Before/After Preview | Not confirmed for v3 | UI recording |
| Source Diff | Scanner POC shows scanner evidence, not migration diff | v3 diff capture |
| Validation | Not confirmed for v3 | UI recording |
| Evidence | Scanner evidence exists; v3 evidence archive not visually confirmed | v3 evidence capture |
| Approval | Not confirmed | UI recording |
| Apply | Not confirmed | UI recording |
| Rollback | Not confirmed | UI recording |
| Rescan | Not confirmed | UI recording |
| Progress Dashboard | Not confirmed | UI recording |
| Lifecycle states | Not confirmed | UI recording |

Passing E2E tests are not treated as recorded visual coverage.

## G. Upload Priority

### PRIORITY 1

1. `CoffeeBreakWeb_RTL-Migration_AR_Master_V1_Clean.mp4` — episode-level review.
2. `Scene-01_Business-Expansion_AR_V5_Clean.mp4` — opening detail.
3. `Scene-02_Broken-RTL_AR_V5_Clean.mp4` — main RTL problem demonstration.
4. `Scene-03_Architecture_AR_V2_Clean.mp4` — architecture explanation.

### PRIORITY 2

- `scanner-flow-poc.mp4`
- `runtime-direction-demo.mp4`

### PRIORITY 3

- Contact sheets, useful for quick visual triage.
- English counterparts and intermediate renders, if language comparison becomes necessary.

## H. Missing Files

All six requested source videos were found and copied successfully. No substitution was made.

The package does not include English counterparts because the request selected the six Arabic/core review files. The package also does not include a dedicated RTL Analyzer v3 screen recording because none was confirmed among the selected files.

## I. Executive Summary

The review package contains six verified, byte-identical copies and six timestamped JPEG contact sheets. The Arabic master is the best first upload for episode-level review, followed by the standalone Scene 01, Scene 02, and Scene 03 videos. The master contains the Scene 01 and Scene 02 footage, so those uploads are intentionally redundant for detailed review.

The selected package provides strong coverage of the existing RTL product story, scanner evidence, and architecture explanation. It does not provide confirmed visual footage of the RTL Migration Analyzer v3 dashboard workflows: recommendations, decisions, candidate preview, validation, evidence archive, approval, Apply, Rollback, Rescan, Progress, or lifecycle states. Those remain recording gaps even though automated browser acceptance exists elsewhere in the repository.

