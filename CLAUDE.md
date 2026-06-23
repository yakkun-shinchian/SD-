# CLAUDE.md

This file guides AI assistants (Claude Code) working in this repository.

## Project overview

**NurseTube（ナースチューブ）** is a static, dependency-free web app: a
"study YouTube" for nurses and nursing students. The mascot **ずんだもん**
explains nursing topics (anatomy/physiology, pharmacology, nursing skills,
diseases, national-exam prep, etc.) in a YouTube-style UI.

Each "program" (番組) is a learning video. When a real YouTube `videoId` is
set, it embeds the actual video; otherwise the app auto-plays a slideshow
(slides + narration) generated from a script, narrated either by the
device's speech synthesis (Web Speech API) or by pre-rendered VOICEVOX
ずんだもん audio.

The entire UI and all content are in **Japanese**, and program/script copy
uses ずんだもん's signature 「〜なのだ／〜のだ」 speech style. Preserve this
tone and language when editing content.

## How to run

No build step, no dependencies. Open `index.html` directly in a browser, or
serve the folder (recommended so search/theme persistence work reliably):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

The Node scripts in `tools/` require Node.js (developed against Node 22) and
have **no npm dependencies** — they use only the `node:` built-ins.

## Architecture

Plain **HTML + CSS + vanilla JavaScript**. No framework, no bundler, no
package.json. Scripts are loaded as plain globals via `<script>` tags in
this order (see `index.html`):

```
data.js  → scenes.js → audio/manifest.js → app.js
```

Each file exposes globals (not modules):

- `data.js` — `CATEGORIES`, `PROGRAMS`, `EXAM_DATE`, `PRESENTER`
- `scenes.js` — `SCENES` (script object keyed by program id)
- `audio/manifest.js` — `AUDIO_FILES` (auto-generated; empty by default)
- `app.js` — the whole app, wrapped in an IIFE (`"use strict"`)

### Routing

Hash-based router in `app.js` (`router()` + `hashchange`):

- `#/` — home (all programs)
- `#/category/<カテゴリ>` — filter by category
- `#/search/<キーワード>` — search title/channel/category/description/tags
- `#/watch/<番組ID>` — watch page (YouTube embed or slideshow player)

### The slideshow player

`createLesson(programId, scenes)` in `app.js` drives auto-play. Playback
priority per scene:

1. Real audio file from `AUDIO_FILES["<id>-<sceneNo>"]` (e.g. VOICEVOX), else
2. Web Speech API narration (`speechSynthesis`, ja-JP), else
3. Silent timed slide advance.

A `token` counter guards against stale timers/utterances when the user
navigates or toggles. Always call `activeLesson.destroy()` on route change
(the router already does this).

## Key files

| File | Purpose |
|------|---------|
| `index.html` | Page skeleton (header, sidebar, main); loads the scripts |
| `styles.css` | YouTube-style UI, player, light/dark theme |
| `app.js` | Rendering, routing, search, slideshow player (IIFE) |
| `data.js` | Program catalog + categories + exam date (**add programs here**) |
| `scenes.js` | Per-program slide scripts (**add scripts here**) |
| `audio/manifest.js` | Auto-generated audio map (`AUDIO_FILES`) |
| `tools/build-voicevox.mjs` | Export scripts → `voicevox/narration.txt` + manifests |
| `tools/link-audio.mjs` | Align VOICEVOX wavs → `audio/` + regenerate manifest |
| `voicevox/` | VOICEVOX export data + detailed how-to (`voicevox/README.md`) |
| `README.md` | User-facing docs (Japanese) |

## Common tasks

### Add or edit a program

1. Add an entry to `PROGRAMS` in `data.js`. Required fields:
   `id` (unique), `title`, `category` (must match a `CATEGORIES` key),
   `channel` (usually `PRESENTER`), `durationSec`, `views`, `published`
   (`YYYY-MM-DD`), `videoId`, `description`, `tags`.
2. Set `videoId` to a YouTube id to embed the real video, or leave it `""`
   to use the slideshow / search-link fallback.
3. For a slideshow, add `SCENES["<id>"] = [...]` in `scenes.js`. Each scene:
   `{ heading, points: [...], narration }`. The `narration` is read aloud
   and shown as caption.

### Add or change a category

Edit `CATEGORIES` in `data.js`. `key` must match `PROGRAMS[].category`;
`color` drives the thumbnail gradient, `icon` is an emoji, `label` is shown.

### Generate real ずんだもん voice (VOICEVOX)

```bash
node tools/build-voicevox.mjs   # rebuild voicevox/narration.txt + manifests
# → render narration.txt in VOICEVOX (speaker: ずんだもん ノーマル),
#   put exported wavs in voicevox/export/  (gitignored)
node tools/link-audio.mjs       # copy into audio/ and regenerate audio/manifest.js
```

Scenes are numbered program-order then scene-order; the positional order in
`narration.txt`/`manifest.json` must match VOICEVOX's batch export order.
Re-run `build-voicevox.mjs` whenever `data.js`/`scenes.js` change.
⚠ Using VOICEVOX ずんだもん audio requires the credit「VOICEVOX:ずんだもん」.

## Conventions

- **Language & tone:** Japanese throughout; ずんだもん 「〜なのだ」 style for
  all user-facing and content copy. Match the existing voice.
- **No dependencies / no build:** keep it vanilla. Don't introduce npm
  packages, frameworks, or a bundler without explicit need. Use globals, not
  ES modules, in the browser code (`tools/*.mjs` do use `node:` ESM imports).
- **Security:** user/content text is escaped with `escapeHtml()` before being
  inserted into `innerHTML`. Keep using it for any dynamic string in markup.
- **State:** theme is persisted in `localStorage` (`nursetube-theme`).
- **No tests / no CI / no linter** are configured. Verify changes by opening
  the app in a browser and exercising the affected route.

## Git workflow

- Develop on the branch assigned for the task; create it locally if missing.
- Commit with clear, descriptive messages (existing history is in Japanese).
- Push with `git push -u origin <branch>` and open a draft PR.
- This is a static site, deployable as-is via GitHub Pages (root folder).
