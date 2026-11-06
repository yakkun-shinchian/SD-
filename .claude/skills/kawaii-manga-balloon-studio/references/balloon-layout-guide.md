# Balloon layout guide

## Default contract

- For new Kindle manga, use the reference page architecture from `create-kawaii-bilingual-manga-pages`: bordered rectangular panels, normally one large lead panel above three numbered support panels.
- Use `bilingual-portrait` only for an explicitly requested single-panel fallback or an existing legacy page.
- Put Japanese main copy first and a natural English companion translation immediately below it in every balloon.
- Use a soft rounded `speech` or `thought` balloon.
- Keep the balloon fill, outline, tail, both languages, panel numbers, labels, and captions completely outside every protected face zone.
- Reject and recompose a page when any intersection is detected; do not downgrade a collision to a warning.

## Choose the balloon

| Kind | Use | Avoid |
|---|---|---|
| `speech` | default rounded oval; ordinary dialogue and dry workplace humor | long narration |
| `thought` | rounded inner voice, suppressed complaint, quiet irony | several speakers on one page |
| `shout` | explicitly requested alarm or punch line | default use; its jagged outline breaks the rounded style |

Use narration boxes for time or place, not as a substitute for a shorter joke.

## Write for a phone screen

- Put recognition before explanation: “また点滴、増えました？” is stronger than a paragraph describing the situation.
- Keep one semantic beat per balloon.
- Prefer concrete nouns and verbs. Remove greetings and repeated subjects when the scene already supplies them.
- In every preset, keep Japanese and English in separate typographic bands inside the same rounded balloon; never interleave the English with the Japanese lines.
- Use a bold Japanese sans-serif font. Do not bundle a font without a verified redistribution license.

## Reserve space in the art prompt

Specify a quiet, low-detail region by normalized coordinates and state what must not enter it. Example:

> Portrait single-panel manga. Reserve the upper-left 42% × 20% as pale, uncluttered negative space. No text, letters, symbols, empty balloons, signage, logos, or watermark.

Do not rely on removing generated gibberish later. Reject and regenerate pages with accidental lettering when it damages the composition.

## Geometry

- Keep each balloon inside its rectangular panel and inside the page safe zone.
- Leave padding equal to roughly 10–14% of the smaller balloon dimension.
- Use a tail long enough to identify the speaker but short enough not to cross a face or another balloon.
- Avoid every visible facial oval, including background people. Also protect hands, medication labels, monitors, and the visual cause of the joke.
- If two balloons overlap, rewrite or move them; do not shrink the font first.

## Dialogue manifest fields

Required page fields:

- `page_id`
- `scene`
- `alt_text`
- `balloons`

Required balloon fields:

- `id`, `speaker`, `kind`, `text`
- `x`, `y`, `w`, `h` as normalized coordinates
- `tail_x`, `tail_y` as normalized coordinates for `speech` and `thought`

Optional balloon fields:

- `font_size`: fraction of page height; default `0.034`
- `translation`: brief English gloss used by the bilingual portrait preset
- `translation_font_size`: fraction of artwork height; default `0.026`
- `translation_position`: `bottom-right` or `bottom-left`; default `bottom-right`
- `fill`: RGB array; default white
- `outline`: RGB array; default near-black
- `text_color`: RGB array; default near-black

Optional page field:

- `allow_non_round_balloons`: default `false`; set `true` only after the user explicitly requests a jagged `shout` balloon

## Review sequence

1. Read the plain dialogue without art. Confirm the joke and speaker voice.
2. View the art without dialogue. Confirm the scene carries the setup.
3. View the full page. Confirm tail direction and visual hierarchy.
4. View at 100% and confirm that no fill, outline, glyph, or tail touches a face.
5. View at 25% scale. Confirm every word remains legible.
6. Inspect the assembled PDF/EPUB and repeat the face-collision check after export.
7. Read the book in sequence. Remove repeated phrasing and emotional monotony.
