# Safe main integration — 2026-11-05

## Dependency snapshot

- #17: draft, main <- claude/yakubon-studio-motion (9aacba7).
- #18: draft, #17 <- codex/mp4-scene-editor (5190b43).
- #20: draft, #18 <- codex/narration-silence-check (9c179dc).
- #25: merged into #17; CT simultaneous annotation code retained unchanged.
- #26: merged into #20; leading black detection inherited.
- All five: no unresolved review threads or change-request reviews. #25/#26 bot summaries report no findings.
- #17/#18/#20: no status checks / PR workflow runs recorded at inspection.

Merged main, #17 (including #25), and #20 (including #18/#26) into one integration branch without conflicts. This preserves ancestry; only studio additions and its regression workflow differ from main. Existing website/player code and production MP4 files are untouched.

## Findings fixed

1. Black trimming ignored silence_check.keep. Both keep lists now veto the entire prefix cut when overlapping, protecting CT scroll and intentional darkness.
2. auto_cut=true could be reused indiscriminately across materials. Cutting now requires an explicitly reviewed master SHA256; missing/stale review leaves output uncut. Default remains detection-only.
3. Existing audio+subtitle cut regression failed on FFmpeg 7.1.5: the 11-frame trimmed stream reported 1.0 s, and subtitle re-encoding lost its final frame. Rebuild PTS from frame index and specify output fps; preserve timestamps during subtitle burn-in.
4. Added a Studio-specific PR/main CI workflow; the prior Pages workflow provided no PR regression coverage.

## Verification

- Python MP4 suite: 31 passed, including 24/30/60 fps audio/subtitle cut matrix, keep veto, stale review, strict navy/CT-marker protection, master reuse and restoration.
- CT / M3 / M4 suite: 29 passed. Existing renderer, CT annotation and emphasis implementations unchanged.
- git diff --check passed.
- Actual repository medical videos anat01-v5-review.mp4 (heart), anat02-v5-review.mp4 (kidney), anat03-v5-review.mp4 (respiration): full-resolution detection found no leading black; sampled opening frames at 2 fps over the first 3 seconds visually show content. Exact input hashes and reports in real-material-black-check.json. These files were not rewritten.
- This is NOT a real CT-scroll / TEVAR / CoeFont synchronization acceptance test. Those original production sources were not exercised. No production manifest is enabled for automatic cutting. Enable only after examining that material's uncut master, audio and caption timing; retain intentional-darkness/CT keep intervals.
- Generic MP4 scene assembly uses explicitly supplied audio tracks, not embedded scene audio. Do not feed a voiced finished MP4 as a silent scene and expect its original sound to be retained.
