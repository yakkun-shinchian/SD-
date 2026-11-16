# Part 2 rectangular-panel page contract

Apply this contract to every manga page. Rectangular panels are the containers; all voices use round balloons; protected faces and heads remain untouched.

## Page map

All page coordinates are proportions of the final portrait canvas. Artwork-sheet coordinates are normalized within the square manga frame.

| Region | Approximate bounds | Required treatment |
|---|---:|---|
| Canvas | exact `1009:1536` ratio | Warm ivory portrait page; exact multiples allowed |
| Header and titles | page `y .02–.11` | Series, category, scene, Japanese title, English subtitle |
| Manga frame | page `x .02–.98`, `y .115–.745` | One dark rectangular outer frame around a square panel sheet |
| Main panel | artwork `x 0, y 0, w 1, h .64` | Large setup panel with principal round bilingual balloon |
| Lower panels | artwork `y .64–1` | Three equal rectangular panels for beats 1–3 |
| Learning block | page `y .76–.94` | Japanese/English explanation, points, usable phrases |
| Footer | page `y .96–.985` | Small quiet series and credit line |

Use consistent narrow gutters. Keep every panel edge straight and rectangular.

## Voice balloon contract

- Every spoken line, reply, reaction, and courtesy phrase must be inside a balloon.
- `shape` must be `circle`, `ellipse`, `oval`, or `round`.
- `kind` must be `speech` or `thought`.
- Speech uses a smooth oval body and a simple triangular tail.
- Thought uses a smooth oval body and a short sequence of round dots only when explicitly useful.
- Jagged, burst, cloud, square, rectangular, narration, sticker, and decorative voice shapes are forbidden.
- The complete body, outline, tail or dots, Japanese, and English must remain inside the assigned panel with at least a 1.5% visual inset.
- Japanese occupies the upper text band; the smaller natural English occupies the lower band.
- Short replies still receive a small round or oval balloon.

Rectangular containers are allowed only for non-spoken page furniture outside the artwork.

## Face and head protection

Record a normalized rectangle for every visible head or face. Include the complete hair silhouette and a small margin.

```json
{
  "id": "main-ca-head",
  "kind": "head",
  "x": 0.12,
  "y": 0.14,
  "w": 0.22,
  "h": 0.24
}
```

The validator expands every protected rectangle by 2% of the artwork, clipped to its own panel. The balloon body and the path from balloon center to its tail target must stay outside that clearance. Protect back-facing and background heads too.

Tail targets should end in empty space beside a shoulder or chest. They must not cross an eye, cheek, mouth, hair, hand, another character, or a panel border.

## Copy and type limits

- Japanese balloon copy: 12–32 characters preferred, 45 maximum.
- English balloon copy: 2–12 words preferred, 14 words and 90 characters maximum.
- Use meaning-first natural English, not romaji or literal Japanese word order.
- Keep both languages in the same balloon and preserve comfortable mobile readability.
- If the copy does not fit, rewrite before reducing type.

## Unlettered artwork prompt contract

Adapt this block to the page scene:

> One square unlettered four-panel manga sheet: one large rectangular upper panel and three equal rectangular lower panels, narrow consistent gutters, polished contemporary commercial anime finish, gentle natural color, fictional adult characters, expressive unobstructed faces, complete heads and useful hands, believable workplace details. Reserve pale uncluttered round-balloon space in every panel and place all faces outside those spaces. No text, letters, numbers, speech balloons, captions, logos, watermarks, cropped heads, or objects covering faces.

## Manifest minimum

Provide:

- `page_id`, `layout: "bilingual-panel-page"`, scene, Japanese alt text, and review status;
- exact-ratio canvas and complete header;
- exactly four default panel rectangles with unique IDs;
- protected zones for every visible head and face;
- one to eight balloons, each with panel ID, speaker, kind, shape, bilingual copy, normalized geometry, and tail target;
- a balloon in each speaking panel or `silent: true` for a deliberately silent panel;
- caption, exactly two Japanese explanation lines, exactly two English explanation lines, three points, three phrase pairs, and footer.

Start from `assets/four-panel-page-template.json`.

## Acceptance test

Reject the page if any answer is no:

1. Is the manga fully enclosed by the rectangular outer frame?
2. Are the default one-large-plus-three-small panels straight, rectangular, and non-overlapping?
3. Is every voice inside a smooth round or oval balloon?
4. Are the full balloon, tail, text, and outline inside one panel?
5. Are all faces, complete heads, and hair silhouettes unobstructed with visible breathing room?
6. Are Japanese and English readable at 25% scale?
7. Is the artwork free of accidental lettering, logos, and repeated composition?
