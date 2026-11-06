# Bilingual portrait single-panel fallback

Use this specification only when the user explicitly requests a single-panel page or when repairing an existing legacy single-panel composition. For new Kindle manga pages, use the multi-panel YAKUBON reference system in `create-kawaii-bilingual-manga-pages`.

Unless the user explicitly says otherwise, make the page Japanese-English bilingual and use a soft rounded oval balloon. Face safety is mandatory: no balloon body, tail, or text may enter a protected head or face zone.

## Page map

All values are proportions of the full page unless stated otherwise.

| Region | Recommended bounds | Purpose |
|---|---:|---|
| Canvas | `1024:1536` aspect ratio | Portrait fallback master; higher exact multiples are allowed |
| Header | `x .06–.94`, `y .03–.065` | Category pill and series/page label |
| Artwork frame | `x .063`, `y .068`, `w .874`, `h .574` | Nearly square anime scene with a dark keyline |
| Balloon band | top `.02–.34` of artwork | Large Japanese line plus small English gloss |
| Character band | middle/lower artwork | Face, expression, pose, and joke action |
| Caption block | `x .082–.92`, `y .68–.91` | Headline, two Japanese lines, two English lines |
| Footer | `x .065–.94`, `y .945–.97` | Quiet series label |

Keep at least 5% page-safe margin. Use a warm ivory background near RGB `[248, 245, 238]`, near-black text, and one restrained category accent color.

## Visual hierarchy

1. Facial expression and action
2. Large Japanese balloon text
3. Bold Japanese headline below the art
4. Japanese two-line reflection
5. English balloon gloss and English two-line reflection
6. Header and footer labels

The English is a helpful companion, not a second headline. Set the balloon gloss at roughly 38–48% of the Japanese text size and place it in a separate lower band beneath the Japanese. Use medium gray and keep one full Japanese-character width of padding from the outline.

## Balloon rules

- Prefer one rounded oval `speech` balloon. Use rounded `thought` for an inner voice. Use jagged `shout` only when the user explicitly requests it and set `allow_non_round_balloons` to `true` in the manifest.
- Keep Japanese to two strong lines when possible. Rewrite before reducing the type size.
- Keep English to one short line; permit two only when a natural phrase cannot fit.
- Never place English between Japanese lines.
- Keep the gloss in its own lower band so it cannot collide with the main copy.
- Keep the tail clear of eyes, facial features, hair, hands, and English text.
- Do not let the balloon occupy more than about one third of the artwork height unless the protected zones still have generous clearance.

## Face protection

Add a rectangle for each head or face to `artwork.protected_zones`. Coordinates are normalized to the artwork, not the outer page.

```json
{
  "id": "main-head",
  "kind": "face",
  "x": 0.34,
  "y": 0.37,
  "w": 0.25,
  "h": 0.24
}
```

Include the complete facial oval and a small margin; include hair when a head-safe composition is required. The validator expands each face rectangle by another 2% of the artwork on all sides. A balloon fill, outline, glyph, or any part of its tail entering that expanded rectangle is an error. Move the balloon, retarget the tail toward a shoulder or empty space beside the head, or regenerate the art.

## Lower bilingual caption

Use this order:

1. bold Japanese headline, normally one line;
2. two Japanese reflection lines;
3. two English reflection lines in smaller gray type.

Keep each English line concise enough to remain readable at 25% preview scale. Translate the emotional meaning naturally. Avoid romaji, literal word order, extra explanation, and textbook phrasing.

Example:

```text
指示は、まだですか
時計は進む。点滴は待てない。
私たちの段取りだけが、宙に浮いている。

The clock keeps moving; the IV cannot wait.
Only our carefully laid plans remain suspended.
```

## Artwork prompt contract

State the following constraints explicitly when generating the raw scene:

> Portrait-ready square anime panel, polished commercial manga finish, adult characters, expressive unobstructed faces, complete head and hands, believable workplace details. Reserve the upper 30% as pale uncluttered negative space. No text, letters, numbers, speech balloons, signage, logos, watermarks, cropped head, or object covering a face.

Reject artwork with accidental text, a cropped head, malformed hands that dominate the scene, a face inside the planned balloon band, or a repeated composition from an earlier page.

## Manifest fields

For `layout: "bilingual-portrait"`, provide:

- `canvas.width`, `canvas.height`, and optional colors;
- `header.category_ja`, `header.series_label`, and `header.number`;
- `artwork.protected_zones` with at least one `kind: "face"` rectangle;
- each balloon's Japanese `text` and short English `translation`;
- optional top-level `allow_non_round_balloons: true` only for an explicitly requested jagged balloon;
- `caption.headline_ja`, two `body_ja` entries, two `body_en` entries, and `footer`;
- optional `caption.accent_span_ja` for the short colored underline.

Use normalized artwork coordinates for balloons and protected zones. The compositor creates the outer page, fits the raw image into the artwork frame, and renders all lettering afterward.
