---
name: kawaii-manga-balloon-studio
description: Plan, typeset, validate, and assemble face-safe Japanese-English manga balloons for Kindle, paperback, and previews. Default every manga page to bordered rectangular panels, soft rounded speech or thought balloons, Japanese followed by natural English inside every balloon, and zero overlap between any balloon body, outline, glyph, tail, label, or number and any visible face. Use for occupational “あるある” comics, bilingual workplace manga, one- to four-panel pages, large readable lettering, dialogue manifests, or fixing missing English, angular balloons, malformed text, unreadable translations, or lettering that covers a face.
---

# Kawaii Manga Balloon Studio

Create lettering in two controlled stages: generate or receive clean artwork first, then typeset proofread Japanese and English deterministically. Never ask an image model to render final lettering.

## Apply the fixed house defaults

Apply these rules to every manga page without asking the user to repeat them:

- place the artwork inside clean rectangular manga panels;
- use a soft oval speech balloon by default and a soft rounded thought balloon for inner speech;
- put Japanese first and natural English immediately below it inside every balloon;
- make Japanese visually primary and English smaller but readable;
- keep the complete visible face and expression unobstructed by balloon fills, outlines, tails, Japanese, English, panel numbers, labels, and captions;
- reject and recompose any page with a face collision, however small.

Depart from bilingual copy or rounded balloons only when the user explicitly requests a different treatment. Face visibility remains mandatory even when the user changes the language or balloon style.

## Route the page architecture

For every new Kindle manga page or book, use `create-kawaii-bilingual-manga-pages` as the page-architecture authority. Its default is the approved YAKUBON reference system: a portrait page with one large lead panel above three numbered support panels, with one to three panels allowed when the story genuinely needs fewer.

Use this skill for balloon wording, font fitting, language hierarchy, geometry, and collision validation. Use the bundled `bilingual-portrait` compositor only for an explicitly requested single-panel fallback or when repairing an existing legacy single-panel page. Do not let that legacy preset replace the current multi-panel house standard.

Read `references/balloon-layout-guide.md` before drafting or reviewing balloons. Read `references/bilingual-portrait-layout.md` only when using the single-panel fallback.

## Build and proofread the dialogue manifest

For a house-standard multi-panel page, use the manifest from `create-kawaii-bilingual-manga-pages`. For a single-panel fallback, copy `assets/dialogue-page-template.json`.

- Use one balloon per panel by default; use two only when a reply is essential.
- Use one semantic beat per balloon.
- Keep Japanese to one to three concise spoken lines.
- Keep English to one or two shorter natural lines that preserve meaning, politeness, and comic timing.
- Keep Japanese and English in separate internal bands; never interleave them.
- Rewrite before shrinking type. Do not trade readability or face visibility for word count.
- Record every visible face or head in the protected zones before composition.
- Record scene, page ID, speaker, balloon geometry, language, alt text, and review status.
- Use fictional composite characters and remove patient identifiers, workplace names, logos, and accusations about identifiable people.

Proofread all Japanese and English as plain text before typesetting.

## Protect every visible face

Treat zero face overlap as a hard publishing gate.

1. Generate or obtain artwork without lettering, balloons, signage, logos, or watermarks.
2. Mark every facial oval, including background people, and expand it by the required safety margin.
3. Place the balloon in calm background space beside the speaker, not on the face.
4. Keep the balloon fill, outline, Japanese glyphs, English glyphs, and tail corridor completely outside every expanded face region.
5. Point the tail toward a shoulder or adjacent empty space when a direct line toward the mouth would cross the face.
6. If validation finds a collision, move or resize the balloon, shorten the dialogue, retarget the tail, reframe the panel, or regenerate the art.
7. Never solve a collision by hiding facial features, covering the face with white, or making the type unreadably small.

Also protect complete crowns and chins, hands, medication labels, monitor values, and the visual cause of the joke when those details matter.

## Direct the artwork for later lettering

Use refined contemporary manga linework, translucent watercolor, soft natural color, believable workplace props, expressive adult characters, and readable body language. Reserve low-detail negative space near each speaker while keeping the face outside that space. Vary face, hair, pose, camera, clothing, setting, and lighting across a collection. Do not imitate a named living artist.

For healthcare humor, preserve clinical plausibility and aim the joke at systems, timing, or shared work experience rather than vulnerable patients.

## Typeset and inspect

1. Draft and proofread the complete Japanese-English manifest before generating or composing art.
2. Inspect the raw art for anatomy, props, uniforms, expressions, accidental text, and repeated compositions.
3. Validate face and balloon geometry before rendering.
4. Compose with embedded Japanese-capable fonts. Use a clear gap between Japanese and English.
5. Inspect every page at 100% and at approximately 25% scale.
6. Inspect the actual assembled PDF and EPUB, because export can move fonts or balloons.
7. Return failed pages for recomposition and repeat validation; do not approve them with a warning.
8. Verify all pages in an iPad-readable PDF and, when applicable, Kindle Previewer.

For the single-panel fallback only:

```bash
python3 scripts/compose_balloon_page.py \
  --background page-001-art.png \
  --spec page-001.json \
  --output page-001-final.png \
  --font /path/to/NotoSansCJK-Bold.ttc
```

Run the same command with `--validate-only` before rendering.

## Quality gate

Do not call a page or collection ready until:

- every panel is a clean bordered manga frame;
- every balloon is soft and rounded unless the user explicitly requested another safe style;
- every balloon contains Japanese followed by natural English;
- every visible face and expression is complete and unobstructed;
- no balloon body, outline, Japanese text, English text, tail, panel number, label, or caption intersects a protected face region;
- Japanese remains the strongest text and English remains readable at thumbnail size;
- wording, punctuation, line breaks, translation tone, and series labels are consistent;
- artwork contains no generated gibberish, real logos, private information, or unsafe clinical claims;
- no face, joke, pose, prop arrangement, or background is repeated unintentionally;
- every page retains the same resolution, watercolor finish, line quality, and typesetting through the final page;
- the final PDF/EPUB render has passed a second zero-collision review.

Soft words belong close to the speaker. The face itself remains sacred space.

