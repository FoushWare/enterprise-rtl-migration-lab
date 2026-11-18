# Runtime direction POC — review and reproduction

Source: latest worktree, detached b127325a14ad3bf8e70aede2a2e29b9dae638355. Existing nx.json modification preserved; all tracked hashes matched the previous baseline. Production source/configuration was not edited. No Git switches, commits, pushes or publishing.

## Verified behavior
- cli.ts calls scan(), serializes JSON/Markdown and sets exit status.
- scan.ts discovers Nx app/library source roots; loads policy; calls CSS, HTML or TypeScript extractors; collects Evidence and Diagnostics.
- Diagnostics are records, not a separate execution stage.
- detect(evidence, sources, policy, diagnostics) can inspect TypeScript AST directly and mutate diagnostics.
- scan.ts first calls detect() for policy-audit anchors, with effect-bearing policy entries disabled. A second call produces final findings with the effective policy. Audit diagnostics use a cloned collection.
- rules.ts:52 resolves an imported createTheme call, finds its direction property and tests !ts.isStringLiteral(p.initializer). It does not evaluate getDirection().
- This exact input is in detection.test.ts:35. The video formats that input over multiple lines; it does not claim it is production application code. The original real test and rule were recorded in VS Code.
- Running source/verify.mjs against the compiled current scanner modules produced evidence/verified-run.json: parser Evidence=[], Diagnostics=[]; after detect(), one blocking RUNTIME_DIRECTION_UNKNOWN Diagnostic and one RTL.RUNTIME.DIRECTION_UNKNOWN Finding. Category RUNTIME_CONFIG, severity Minor, confidence Low, suggestion null, evidenceIds []. These are separate explicit operations, not automatic Diagnostic-to-Finding conversion.
- Blocking diagnostics prevent complete=true in scan.ts and constrain safe candidates in rules.ts.
- model.ts Report contains Evidence, Diagnostics, Findings and Metrics; report.ts serializes these. Final report routing in the animation is conceptual; the stored fixture invocation captures actual detect results, not an invented complete scan report.
- CSS parser uses PostCSS; HTML uses parse5; TypeScript extractor uses the TypeScript AST. Policy is data-only and validated. Coverage classifies uncertainty.

## Visual/source boundaries
Actual screen recording: evidence/vscode-real.mp4. Original recording is intact. Readable code panels are explicitly labelled formatted/selected excerpts; explanatory comments and omitted arguments are not literal complete source listings. AST and flowing connectors are conceptual motion graphics. Actual record fields come from verified-run.json.

## Tools and audio
FFmpeg + Pillow render reproducible 1920x1080/30 FPS H.264. Arabic uses Arial, arabic-reshaper and python-bidi; code is LTR Menlo. New scene structure and visual design were authored for this POC. Previous video was inspected only for quality comparison.

Edge TTS ar-EG-ShakirNeural produced the sample and all five segments successfully without API keys or paid charges. Client installed only into /private/tmp/rtl-explainer-tts. Only generic educational narration was sent; no repository source, credentials or sensitive data was uploaded. This is an unofficial client to an external service, whose availability may change. The session cannot listen to audio; pronunciation/naturalness require human audition. No claim of auditory QA is made. Voice is the provider's Egyptian Arabic male profile.

Narration segments, narration.wav and original synthesized sfx.wav are separate. No third-party music. Without-narration MP4 retains only subtle effects. The scene timing JSON, narration JSON, SRT and render/compose scripts remain editable. SRT uses scene-local phrase timing, not forced word alignment; human speech-sync review remains necessary.

## Reproduce / replace voice
1. node source/verify.mjs (absolute root currently points to the verified worktree).
2. /private/tmp/rtl-explainer-tts/bin/python source/voice.py (network; generic narration only).
3. /private/tmp/rtl-explainer-tts/bin/python source/render.py
4. bash source/compose.sh
Replace the five scene MP3s with your voice, update audioDuration via ffprobe, and rerun render.py/compose.sh. Use the stored TTS profile only if regeneration is wanted. Production source does not need changes.

## Limitations and review gates
This POC explains one structural branch, not the entire scanner. Original dense lines are shown as provenance while formatted excerpts provide readability. Source recording has little cursor movement; the teaching motion is in progressive AST inspection and separate output lanes. Review Egyptian pronunciation and caption timing before approving the full production. No full episode, vertical video or publication was produced.
