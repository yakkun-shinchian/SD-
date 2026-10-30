# YAKUBON reference bilingual manga page-style bible

Use this house system to reproduce the supplied CA “Before Boarding” reference pages as the default Kindle manga language. The defining features are bordered rectangular panels, soft watercolor manga, Japanese-English rounded balloons inside the panels, a calm bilingual lower section, and complete facial visibility.

## Contents

1. Reference priority
2. Visual signature
3. Page anatomy
4. One- to four-panel presets
5. Balloon system
6. Reflection block
7. Face-safe placement
8. Typography
9. Art prompts
10. Long-book variation and rejection rules

## 1. Reference priority

Use an attached reference page as the highest visual authority. When no new reference is attached, use the YAKUBON CA reference system represented by the approved ten-page sample. Preserve its:

- ratio of artwork to white space;
- large-to-small panel rhythm;
- warm watercolor manga texture;
- restrained navy, blue-gray, warm ivory, taupe, and muted accent palette;
- soft oval balloons and fine outlines;
- Japanese first and smaller companion English immediately below it in every balloon;
- one large lead panel above three numbered support panels as the normal four-panel rhythm;
- calm lower Japanese and English commentary, point, and useful-phrase areas;
- complete separation between all faces and every balloon, tail, glyph, number, and label.

Do not mechanically copy identities, copyrighted characters, logos, branded uniforms, or exact illustrations. Reproduce the page system and emotional tone.

## 2. Visual signature

- refined modern manga linework in warm charcoal or deep navy;
- transparent watercolor washes, subtle paper grain, and softly pooled pigment;
- attractive adult facial structure, expressive eyes, restrained blush, and believable anatomy;
- detailed but breathable settings with plausible tools and spatial continuity;
- white or warm-ivory page furniture with thin navy rules and generous margins;
- gentle professionalism, shared humor, and quiet emotional warmth.

Avoid flat clip art, plastic 3D, photorealism, chibi proportions, oversized sparkling eyes, children's-cartoon outlines, neon saturation, muddy page-wide washes, or generic stock poses.

## 3. Page anatomy

Default master: `2048 × 3072 px`, portrait, sRGB. This is a high-resolution exact multiple of the approved `1024 × 1536` reference ratio.

| Zone | Approximate span | Contents |
|---|---:|---|
| Header/title | 3–11% | Small series/scene label and concise Japanese-English title |
| Story area | 12–72% | One to four illustrated panels with rounded bilingual balloons |
| Commentary | 74–95% | Japanese and English reflection or explanation, plus point/phrase cards when instructional |
| Footer | 96–99% | Series, volume, page number, copyright |

Keep at least 4% horizontal page margin and about 1.5–2% gutters. Use thin deep-navy rectangular panel borders; slightly softened outer corners are acceptable, but the panels must still read as manga frames. For instructional pages, include compact “ポイント / Point” and “使えるフレーズ / Useful phrases” material in the commentary zone. For reflective “あるある” pages, use the same space for the character's bilingual reflection.

## 4. One- to four-panel presets

Read exact normalized frames from `assets/layout-presets.json` in the skill folder.

| Count | Visual rhythm | Narrative use |
|---:|---|---|
| 1 | One large full-width story panel | A single expression, confession, realization, or strong moment |
| 2 | Large lead panel over one full-width response panel | Setup/response, before/after, question/answer |
| 3 | Large lead panel over two equal panels | Setup, two reactions, or action and emotional result |
| 4 | Large lead panel over three equal numbered panels | Default Kindle manga lesson/あるある rhythm: main scene followed by three compact steps or reactions |

Default to `hero-plus-three` when the user asks for a Kindle manga page without specifying panel count. Use one to three panels when the moment genuinely needs fewer beats. Never subdivide a one-panel idea into filler or collapse a genuine sequence into one crowded picture. Keep cast, clothing, setting, props, time, and emotional continuity within a page.

## 5. Balloon system

### Shape and finish

- Default to a horizontally soft oval inside the rectangular manga panel. Permit a heavily rounded rectangle or soft cloud only when it remains gentle.
- Use white or warm ivory at roughly 94–98% opacity.
- Use a fine charcoal/navy outline, visually about 3–4 px on a 1600 px-wide page.
- Use a short, gently curved or rounded tail; avoid long spears and sharp starbursts.
- Permit a soft cloud thought balloon when the content is inner speech.
- Keep subtle shadowing minimal; the balloon should feel printed on the page, not like a glossy app popup.

### Language hierarchy

- Put Japanese first, large and easy to read, normally one to three short lines.
- Put English inside the same balloon, smaller and lighter, normally one or two short lines immediately below the Japanese.
- Keep Japanese and English in separate internal bands with a visible breathing gap. Do not interleave the languages.
- Keep English subordinate without making it microscopic; test at 25% scale and on an iPad.
- Translate intent, politeness, and emotional temperature rather than word order.

Every panel needs at least one bilingual balloon. Use two only for an essential reply. If text does not fit, rewrite it before shrinking type or covering a face. Sharp rectangles, angular popups, and default jagged balloons fail the house standard.

## 6. Reflection block

Place a calm bilingual note below the story area.

- Reflective pages: use exactly two or three short Japanese lines expressing belief, care, pride, doubt, hope, professional intention, or a small realization.
- Instructional pages: use a short Japanese explanation and its natural English companion, then compact point and useful-phrase material that matches the panels.
- English: place the concise natural explanation or companion translation beneath the corresponding Japanese.
- Styling: dark navy body text on white/warm ivory, with one muted accent rule or tiny label.
- Use a pale blue phrase card and a small point block when the page is instructional; keep both optional for purely reflective manga.

Avoid generic motivational filler. Tie the reflection to the specific action and emotion shown above.

## 7. Face-safe placement

The reference look allows lettering inside the art and close beside faces. Preserve that closeness while keeping facial expressions completely readable.

- Protect every visible facial oval: eyebrows, eyes, nose, mouth, cheeks, and chin, including secondary and background people.
- Add a small normalized margin, normally `0.012`, around the face—not a page-sized exclusion zone around the whole person.
- Allow balloons over quiet background, clothing, or nearby open space when story details remain clear.
- Treat the balloon fill, outline, Japanese glyphs, English glyphs, tail corridor, panel number, caption, and label as collision-tested text regions.
- Let a tail point toward the speaker's shoulder or nearby empty space but stop before the expanded face region.
- Move or rewrite a balloon that intersects a face. Do not solve the problem by hiding the face or reducing text to illegibility.
- Check secondary and background faces as well as the lead character.

Record all coordinates in page-normalized form and run the face-text validator before composition and after the final PDF/EPUB render. Zero intersection means zero intersection; “only a little over the cheek” fails and returns the page for recomposition.

## 8. Typography

- Japanese title: bold CJK Gothic, compact and clear.
- English title: clean humanist sans, about 45–60% of the Japanese title size.
- Balloon Japanese: medium or bold CJK Gothic with generous leading.
- Balloon English: regular humanist sans, about 50–65% of the Japanese visual size.
- Reflection Japanese: readable medium-weight CJK Gothic.
- Reflection English: matching Latin family, slightly smaller and muted navy-gray.

Use installed, embeddable fonts with full Japanese glyph coverage. Never rasterize unproofread language. Verify punctuation, line breaks, font substitution, and readability after PDF/EPUB export.

## 9. Art prompts

Generate clean art without lettering or balloons. Replace bracketed fields.

```text
Use case: illustration-story
Asset type: [one|two|three|four] coherent portrait manga panels for a Kindle bilingual page; no typography
Input image: use only as page-style, palette, texture, and emotional-tone reference; preserve no identity, logo, text, or protected uniform
Primary request: one workplace or everyday moment about [scene objective]
Setting: [specific place and time], with continuity across all panels
Subject: fictional [age]-year-old adult [role], [distinct face, hair, build, original unbranded clothing], unmistakably adult
Panel beats: [one concise action per requested panel]
Style/medium: original refined modern manga, fine warm-charcoal lines, translucent watercolor, subtle paper texture, premium Japanese editorial illustration
Composition: use the selected YAKUBON [1|2|3|4]-panel preset; complete crowns, chins, faces, and hands; reserve quiet background beside each speaker for a later soft oval balloon
Lighting/mood: [plausible light], gentle capable warmth
Palette: deep navy, mist blue, warm ivory, taupe, muted coral, [context accent]
Constraints: coherent cast, clothing, setting, props, and time; adult anatomy; original fictional identities; no text, numbers, bubbles, signage, logos, watermarks, copied characters, celebrities, or branded uniforms
Avoid: cropped face, hidden expression, malformed hands, childlike proportions, sexualized framing, flat vector style, 3D render, photorealism, extra limbs, duplicated objects, gibberish signs, inconsistent continuity, weak background, harsh saturation
```

Generate panels separately and assemble them when one multi-panel generation cannot preserve continuity and finish. A contact sheet is review material, never a substitute for individual final pages.

## 10. Long-book variation and rejection rules

Balance 40–60 pages across:

- close, medium, environmental, and full-body views;
- front, three-quarter, profile, over-shoulder, and action angles;
- calm, focused, welcoming, concerned, amused, tired, relieved, and quietly proud expressions;
- one-, two-, three-, and four-panel pages according to story need;
- distinct locations, times, weather, lighting, props, and interpersonal dynamics.

Reject and regenerate art when a face, crown, chin, hand, or essential object is cropped or malformed; an adult looks child-coded; accidental text or a logo remains; continuity breaks; watercolor becomes flat; or a face, pose, room, and composition duplicate another page without purpose.

Reject and recompose the page when a panel lacks a bilingual balloon; Japanese is not followed by English; the balloon is sharp or visually harsh; Japanese or English overflows; the English disappears at reading size; the lower bilingual section is missing; any balloon body, outline, glyph, tail, number, or label intersects a visible face; or the PDF/EPUB shifts, crops, substitutes fonts, or introduces blank pages.
