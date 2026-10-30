---
name: kawaii-manga-balloon-studio-part2
description: "Create, typeset, validate, and assemble Japanese-English Kindle manga pages in the strict CA ARUARU reference format: rectangular manga panels, one large upper panel plus three lower panels by default, every spoken line inside a smooth round or oval balloon, the complete balloon and tail kept inside its panel, and no balloon, lettering, tail, label, or frame covering any face or hair. Use for occupational あるある manga, bilingual comic teaching pages, four-panel Kindle interiors, or whenever the user asks for 丸い吹き出し・四角いコマ・顔を隠さない as the default."
---

# Kawaii Manga Balloon Studio Part 2

Build the supplied reference style as a strict default. Rectangular panels organize the page; smooth round balloons contain every voice; faces remain fully visible.

## Load the contract

Read `references/page-contract.md` before planning, generating, lettering, or validating a page. Use `references/default-panel-layout.md` for geometry. Read `references/kindle-book-workflow.md` for a full Kindle book, EPUB, cover, or PDF proof. Start each page manifest from `assets/four-panel-page-template.json`.

## Default page structure

- Use the exact `1009:1536` portrait ratio or a higher exact multiple.
- Use a warm ivory editorial page with a series header, Japanese title, English subtitle, and scene label.
- Put the manga artwork inside one dark rectangular outer frame.
- Divide the artwork into one large rectangular upper panel and three equal rectangular lower panels.
- Put Japanese and natural English inside every voice balloon.
- Add Japanese and English explanation, a practical phrase box, concise points, and a quiet footer below the manga.

Use another rectangular panel arrangement only when the user explicitly requests it. The balloon and face-safety rules never change.

## Enforce the voice-balloon default

- Treat every spoken line as voice, including short replies such as `はい`, `ありがとう`, and `どういたしまして`.
- Put every voice inside a white circle, ellipse, or soft oval with a thin dark outline.
- Use a smooth triangular tail for speech. Use only round dots for an explicitly requested thought balloon.
- Keep the whole body, outline, tail or thought dots, Japanese, and English inside one rectangular panel.
- Keep Japanese in the upper band and the smaller English translation in the lower band of the same balloon.
- Forbid rectangular voice boxes, square voice boxes, jagged shout balloons, starbursts, cloud bursts, floating dialogue, and text printed directly on the art.
- Permit rectangles only for non-spoken page furniture outside the manga panels: headers, labels, explanation blocks, phrase lists, and page numbers.

If a round balloon does not fit, shorten the copy, move the balloon, change the composition, or regenerate the art. Never replace it with a rectangle, let it cross a panel border, delete the English, or reduce the type below comfortable phone-size reading.

## Protect every face and head

Record a protected rectangle around every visible head, face, and hair silhouette, including back-facing heads and background characters. Add a 2% artwork clearance around each protected zone.

Keep all of the following outside every expanded protected zone:

- balloon body and outline;
- speech tail or thought dots;
- Japanese and English lettering;
- panel numbers, arrows, labels, and decorative marks;
- panel borders and captions.

Aim a tail toward open space beside the speaker's shoulder or chest. Never run it through eyes, cheeks, mouth, hair, hands, or another character. If a safe placement is impossible, move the balloon first, shorten the dialogue second, alter the shot third, and regenerate the panel last. Never solve a collision by covering or cropping a face.

## Build the manifest before artwork

1. Define the reader, profession, tone, cast boundaries, section, scene, and learning point.
2. Write the four-beat visual flow and proofread every Japanese-English line.
3. Keep balloon copy concise: Japanese 45 characters maximum; English 14 words or 90 characters maximum.
4. Assign every panel and balloon a unique ID.
5. Record a protected zone for every visible head and face.
6. Add Japanese alt text and a review status.

Use meaning-first natural English. Do not use romaji as the translation.

## Generate the unlettered panel sheet

Generate one square, unlettered four-panel artwork sheet matching the default map. Use polished contemporary commercial anime/manga styling, gentle natural color, fictional adult characters, believable workplace details, expressive faces, complete heads, and useful hands. Do not imitate a named living artist.

Reserve pale, low-detail balloon-safe space in every panel. Put the main action and all heads outside those spaces. Request no text, letters, numbers, balloons, logos, watermarks, captions, or signs. Reject malformed focal anatomy, cropped hair, accidental lettering, repeated art, or any face placed in the only safe balloon area.

Add verified dialogue with the compositor after the raw art passes inspection. Do not trust image-generated lettering for final Japanese or English.

## Validate and compose

Run validation before composition:

```bash
python3 scripts/compose_single_balloon_page.py \
  --spec page-001.json \
  --validate-only

python3 scripts/compose_single_balloon_page.py \
  --background page-001-art.png \
  --spec page-001.json \
  --output page-001-final.png \
  --font /path/to/a-japanese-capable-font.ttf
```

Require zero errors. The validator rejects non-round voice shapes, missing Japanese or English, balloons or tails outside their assigned panel, panel overlap, and face/head collisions.

## Inspect every final page

Inspect the raw art and composed page at full size and at about 25% scale. Reject the page if any answer is no:

1. Are all manga panels rectangular and fully inside the outer artwork frame?
2. Is every spoken line inside a circle, ellipse, or soft oval?
3. Are every balloon body, outline, tail, and letter fully inside one panel?
4. Are every complete head, hair silhouette, face, eye, and expression unobstructed?
5. Are Japanese and English both present and comfortably readable?
6. Is the artwork free of generated lettering, real logos, and repeated composition?
7. Are the title, explanation, phrase box, points, numbering, and footer complete?

Correct the manifest, move or shorten the balloon, or regenerate the art; then revalidate and reinspect. Do not paint over a failed collision.

## Assemble a full book

For a Kindle project, apply `references/kindle-book-workflow.md` plus the current applicable Kindle/KDP, PDF, and image skills. Keep the retail cover separate from the interior. Build a fixed-layout EPUB with meaningful alt text and an iPad-readable PDF proof. Verify the complete sequence and perform the final converted-view check in Kindle Previewer or KDP's online previewer.
