# Default rectangular-panel layout

Use this page map for the supplied YAKUBON STUDIO manga reference style. Coordinates are normalized to the square artwork sheet, not the outer portrait page.

## Panel map

| Panel | Bounds | Purpose |
|---|---:|---|
| `main` | `x 0.00, y 0.00, w 1.00, h 0.64` | Main setup and principal bilingual oval balloon |
| `step-1` | `x 0.00, y 0.64, w 0.333, h 0.36` | First short beat |
| `step-2` | `x 0.333, y 0.64, w 0.334, h 0.36` | Second short beat |
| `step-3` | `x 0.667, y 0.64, w 0.333, h 0.36` | Third short beat or reply |

Keep narrow consistent gutters between panels. Treat these values as starting bounds; record the actual visible border coordinates after artwork generation.

## Balloon-safe composition

- Reserve roughly 28–42% of each panel as pale low-detail space.
- Put the principal face and action outside the reserved space.
- Keep a round balloon at least 1.5% inside its panel border.
- Keep the balloon and tail at least 2% away from each protected face/head rectangle.
- Put a small oval balloon around every short reply; never float reply text directly on the art.
- Point the tail toward a shoulder, chest, or empty space beside the speaker rather than through the face.
- Shorten dialogue if the correct round balloon cannot fit safely.

## Outer portrait page

Follow the reference hierarchy:

1. series/volume line and scene label;
2. Japanese title and English subtitle;
3. square four-panel artwork frame;
4. Japanese and English explanation;
5. practical phrase box and concise points;
6. quiet footer and author credit.

Only the manga panels contain voice balloons. Explanation blocks, language tabs, scene labels, and phrase lists may use rectangular containers because they are page furniture, not speech.

## Review checklist

At full resolution, trace every balloon outline and tail. Confirm it remains inside one panel and outside every face/head clearance zone. At 25% scale, confirm the Japanese and English remain readable and no balloon visually appears to touch a face.

