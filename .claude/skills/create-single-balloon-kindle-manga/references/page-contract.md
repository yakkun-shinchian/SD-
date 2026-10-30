# Part 2 single-balloon page contract

Use this contract for every comic page. The format deliberately trades layout variety for a recognizable series identity and dependable face safety.

## Page map

All coordinates are proportions of the final page unless identified as artwork coordinates.

| Region | Bounds | Required treatment |
|---|---:|---|
| Canvas | exact `1009:1536` ratio | Warm ivory portrait page; higher exact multiples allowed |
| Header | `x .06–.94`, `y .03–.065` | Category pill at left; series label and number at right |
| Illustration | `x .063`, `y .068`, `w .874`, `h .574` | Exactly one framed, nearly square scene |
| Balloon band | artwork `y .02–.36` | Exactly one soft rounded oval balloon |
| Character band | artwork middle/lower area | Complete heads, faces, poses, and visual joke |
| Caption | `x .082–.92`, `y .68–.91` | Headline, two Japanese lines, then two English lines |
| Footer | `x .065–.94`, `y .945–.97` | Small quiet series label |

Keep page-safe margins and use a restrained category accent color. Recommended canvas background is near RGB `[248, 245, 238]` with near-black text.

## One illustration only

- Generate one scene as one source image.
- Do not divide the framed art into panels or simulate a collage.
- Do not add inset portraits, reaction boxes, decorative photos, or a second image.
- Create a distinct source image for every page; changing only text does not make repeated art acceptable.
- Keep the visual setup understandable before the balloon and caption are added.

## One rounded balloon only

- Require exactly one entry in `balloons`.
- Permit only `speech` and `thought`.
- Draw both as smooth rounded ovals. A thought balloon may use a short sequence of round dots.
- Forbid `shout`, jagged, burst, cloud, rectangular, narration, sticker, and decorative balloon shapes.
- Keep the complete balloon inside artwork coordinates `x .02–.98`, `y .02–.36`.
- Keep internal padding at roughly 10–14% of the smaller balloon dimension.
- Put Japanese in the main central band and the smaller gray English gloss in its own lower-right or lower-left band.

## Protect every face and head

Record a normalized rectangle for every visible head or face. Include the full hair silhouette and a small visual margin.

```json
{
  "id": "stylist-head",
  "kind": "head",
  "x": 0.31,
  "y": 0.40,
  "w": 0.24,
  "h": 0.26
}
```

The validator expands every protected rectangle by 2% of the artwork on all sides. The balloon body and the path from balloon center to its tail target must stay outside that expanded area. Protect a back-facing head too: hair and head shape remain part of the character and must not be covered.

Aim a speech tail toward empty space beside a shoulder, not toward eyes, cheeks, hair, or hands. Stop thought dots before the protected clearance. If a face rises into the balloon band, regenerate the composition instead of forcing the balloon around it.

## Typography hierarchy

1. Facial expression and action
2. Large Japanese balloon line
3. Bold Japanese headline below the illustration
4. Two Japanese reflection lines
5. Small English balloon gloss and two English reflection lines
6. Header and footer labels

Keep Japanese to two strong lines when possible. Keep English to one short line when possible. Do not interleave languages, put English between Japanese lines, or reduce Japanese until it loses phone-size readability.

## Artwork prompt contract

Include the following requirements in every generation prompt, adapted to the scene:

> One single-panel portrait-ready anime illustration, one continuous scene, polished commercial manga finish, fictional adult characters, expressive unobstructed faces, complete heads and useful hands, believable workplace details. Reserve the upper 30–34% as pale uncluttered negative space. Put all heads and faces below the reserved band. No text, letters, numbers, speech balloons, signs, logos, watermarks, split panels, collage, inset image, cropped head, or object covering a face.

Vary faces, hairstyles, poses, camera distance, camera angle, clothing colors, props, and background arrangement throughout a collection. Do not imitate a named artist.

## Manifest minimum

Provide:

- `page_id`, `layout: "single-balloon-portrait"`, `scene`, Japanese `alt_text`, and `review_status`;
- an exact-ratio `canvas` and complete `header`;
- `artwork.protected_zones` containing every head and face;
- exactly one balloon with `id`, `speaker`, `kind`, Japanese `text`, English `translation`, normalized geometry, and tail target;
- `caption.headline_ja`, exactly two `body_ja` entries, exactly two `body_en` entries, and `footer`.

Start from `assets/single-balloon-page-template.json`.

## Visual acceptance test

Reject the page if any answer is no:

1. Is there exactly one illustration?
2. Is there exactly one smooth rounded balloon?
3. Are every face, full head, and hair silhouette visible and unobstructed?
4. Are the balloon outline, tail or thought dots, and both languages clear of protected zones?
5. Does the Japanese read immediately at 25% scale?
6. Are the English gloss and all four reflection lines present and natural?
7. Is the artwork free of accidental lettering, logos, and repeated composition?

