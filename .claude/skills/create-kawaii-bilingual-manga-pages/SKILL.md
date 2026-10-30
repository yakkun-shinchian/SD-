---
name: create-kawaii-bilingual-manga-pages
description: Create, typeset, validate, and assemble reference-matched soft watercolor Japanese-English manga pages for Kindle. Default to bordered rectangular manga panels, soft rounded speech balloons inside the panels, Japanese followed by natural English in every balloon, and zero overlap between any balloon element and any visible face. Use for YAKUBON STUDIO and KAWAII JAPAN COLLECTION occupational “あるある” comics, bilingual lesson manga, one- to four-panel pages, 10- to 100-page collections, reproducing a supplied page example, and correcting angular balloons, missing English, cropped faces, repeated pages, or lettering that covers a face.
---

# Create Kawaii Bilingual Manga Pages

Create a gentle watercolor manga page that reads as a comic first and a bilingual guide second. Treat the attached YAKUBON reference pages as the house standard for Kindle manga unless the user explicitly requests another design.

## Load the house standard

Read `references/page-style-bible.md` completely before planning, generating, typesetting, or reviewing a page. Use `assets/layout-presets.json` for page geometry and copy `assets/page-manifest-template.json` for every new page.

Apply these defaults without asking the user to repeat them:

1. draw the manga inside clean rectangular panels with fine dark borders;
2. use only soft oval, softly rounded, or soft cloud balloons;
3. put Japanese first and natural English immediately below it inside every balloon;
4. keep every balloon body, outline, glyph, tail, number, caption, and label completely off every visible face;
5. reject and recompose a page when even one protected face intersects a text or balloon region.

Never weaken items 2–5 because a page is crowded. Shorten the dialogue, move the balloon, alter the panel framing, or regenerate the art.

## Follow the reference page system

- Use a portrait page with a warm white or ivory ground, restrained navy furniture, fine panel rules, and soft watercolor manga art.
- Use a compact bilingual series/volume header, a Japanese scene title with a smaller English title, a story area, a bilingual commentary area, and a quiet footer.
- Default an unspecified Kindle manga lesson or occupational “あるある” page to `hero-plus-three`: one large lead panel above three numbered supporting panels.
- Use `single`, `hero-plus-one`, or `hero-plus-two` when the story genuinely needs only one, two, or three panels. Never invent filler to reach four.
- Keep optional “ポイント / Point” and “使えるフレーズ / Useful phrases” cards for instructional pages. For reflective “あるある” pages, use the same lower area for two or three Japanese reflection lines plus a concise English companion.
- Match the supplied page's visual grammar without copying a real identity, protected character, logo, airline, hospital, school, or branded uniform.

## Build the page manifest before art

Create one manifest record per final page.

- Set `style_contract` exactly as supplied in the template. Treat an older manifest without this contract as needing migration before reuse.
- Set `panel_count` to `1`, `2`, `3`, or `4`; make `panels` contain exactly that many entries and use the matching layout preset.
- Give every panel its own action, art asset, and at least one balloon containing non-empty `text_ja` and `text_en`.
- Default every balloon to `soft-oval`. Use `soft-round` or `soft-cloud` only when it serves the dialogue; do not use sharp rectangles or jagged balloons unless the user explicitly overrides the house style.
- Keep Japanese and English as separate typographic bands inside the same balloon: Japanese above, English below. Do not alternate languages line by line.
- Record every visible face and every balloon/text region with normalized coordinates measured from the composed page.
- Keep visual-review flags false while coordinates are only planned. Set them true only after measuring the final page and reviewing its PDF/EPUB render.
- For 20 pages or more, build a variation matrix across face, hair, pose, camera, setting, time, emotion, and props. Remove adjacent look-alikes and duplicate dialogue.

Run `scripts/validate_page_manifest.py` before composition. An explicit page count authorizes production of that count; do not stop at a sample unless the user asks for a sample or a real tool limit blocks progress.

## Write and proofread before generating art

- Keep Japanese balloon dialogue concise, spoken, and normally one to three short lines.
- Add a natural English companion, normally one or two shorter lines. Preserve meaning, politeness, warmth, and comic timing rather than word order.
- Keep English visually secondary but readable on an iPad and at approximately 25% page scale.
- Use a blank line or clear internal gap between Japanese and English; never let the two languages collide.
- For reflective pages, write exactly two or three short Japanese lines expressing the character's belief, feeling, pride, doubt, or professional intention, followed by a concise idiomatic English companion.
- For instructional pages, write short Japanese and English explanations plus concise point/phrase cards that match the depicted action.
- Keep healthcare, aviation, childcare, and other safety-sensitive scenes plausible without presenting the comic as a substitute for formal procedure.

Proofread every Japanese and English string as plain text before typesetting. Never ask an image model to draw final lettering.

## Generate clean art, then typeset

1. Generate each panel without text, balloons, pseudo-letters, numbers, logos, signage, or watermarks.
2. Reserve calm background space beside the speaker, never on the speaker's face.
3. Generate panels separately when a multi-panel image loses identity, anatomy, continuity, or watercolor quality; assemble them afterward.
4. Preserve complete crowns, chins, faces, hands, and essential props. Use unmistakably adult fictional characters unless the user requests another safe subject.
5. Typeset Japanese and English deterministically with embedded fonts after the art is approved.
6. Use `kawaii-manga-balloon-studio` for verified font fitting and rounded-balloon rendering. This skill's page architecture and face-safety contract override incompatible legacy presets.

## Enforce zero face overlap

Treat face visibility as a hard publishing gate. “Almost clear” is a failure.

1. Mark the facial oval of every visible person—eyebrows, eyes, nose, mouth, cheeks, and chin—as a normalized `face_region`; include passengers, patients, coworkers, and background figures.
2. Expand every face region by the manifest's safety padding, normally `0.012` of page width and height.
3. Record balloon bodies, outlines, Japanese glyph blocks, English glyph blocks, tails, panel numbers, labels, and captions as text regions.
4. Keep every recorded text region outside every expanded face region. A tail may point toward a shoulder or nearby empty space but must stop before the protected face.
5. Run `scripts/validate_face_text_regions.py` before composition and again with `--require-review` after the final PDF/EPUB render.
6. If a collision appears, shorten the copy, move or resize the balloon, retarget the tail, reframe the panel, or regenerate the art. Never cover a face, erase facial features, or shrink the words below readable size.

Text may sit close beside a face and may overlap quiet background or nonessential clothing. Do not create a needlessly large empty halo around the entire person; protect the face precisely and completely.

## Maintain quality through the final page

- Compare the first, middle, late, and final pages at full size and thumbnail size.
- Match late pages to approved early pages in watercolor depth, line detail, facial finish, background specificity, typography, and information density.
- Regenerate only failed art and recompose only failed text, then repeat page and sequence review.
- Count and inspect actual final pages. Prompts, filenames, contact sheets, or placeholders are not finished pages.
- Reject duplicated illustrations, cropped heads, malformed hands, accidental text, missing English, unreadable type, and any late-book decline in resolution or finish.

## Assemble the Kindle edition

When the user requests a book, continue with `kindle-visual-book-studio` instead of stopping with loose images.

- Reconcile the production ledger against the individual final pages.
- Create the storefront cover, title page, introduction, contents when useful, afterword, copyright page, and accessible alternative text.
- Produce and inspect the fixed-layout EPUB, iPad review PDF, KDP submission sheet, and cover JPEG.
- Default the author and label to `YAKUBON STUDIO` and the series to `KAWAII JAPAN COLLECTION` unless the user overrides them.
- Stop before the final public Publish action when account, price, territory, KDP Select, or legal confirmation is required.

## Quality gate

Do not approve a page or collection until all of the following are true:

- the rectangular panel layout tells the scene clearly and matches the selected preset;
- every panel contains at least one soft rounded balloon;
- every balloon contains proofread Japanese followed by natural English;
- no balloon body, outline, glyph, tail, number, label, or caption intersects any protected face region;
- all faces, heads, hands, clothing, tools, and backgrounds are credible and free of accidental text or logos;
- the manga-watercolor finish, navy-and-ivory page design, and information hierarchy match the house reference;
- every manifest passes both validators before composition and after final PDF/EPUB rendering;
- every page passes visual review at 100%, thumbnail size, and in the assembled iPad PDF;
- the actual PDF and EPUB pass structural and visual inspection when the request includes a book.

The face carries the feeling. Keep the words near the person, and never let them trespass on that expression.

