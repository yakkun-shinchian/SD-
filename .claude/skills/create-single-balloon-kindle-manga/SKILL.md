---
name: create-single-balloon-kindle-manga
description: "Create, typeset, validate, and assemble the strict Part 2 face-safe manga format: exactly one illustration and exactly one soft rounded speech or thought balloon per page, with no balloon, tail, or lettering covering any face or complete head. Default to Japanese-English bilingual Kindle ‘あるある’ pages in the warm-ivory 1009:1536 portrait layout with a header, framed anime scene, one upper balloon, and bilingual reflection below. Use when the user says 漫画スキルPart 2, asks for the same format as the hair-and-makeup example, specifies 1枚絵・丸い吹き出し・顔にかからない, or requests a one-panel occupational-humor Kindle book in this exact style."
---

# Kawaii Manga Balloon Studio Part 2

Reproduce one controlled page format. Treat the one-image, one-round-balloon, face-safe rules as hard gates rather than preferences.

## Load the page contract

Read `references/page-contract.md` before planning or composing any page. Read `references/kindle-book-workflow.md` when producing a full Kindle book, EPUB, cover, or PDF preview. Copy `assets/single-balloon-page-template.json` once per comic page and replace every example value.

## Enforce the hard gates

- Use exactly one original illustration on each comic page. Do not create split panels, collages, inset pictures, or repeated artwork.
- Use exactly one smooth rounded oval balloon. Choose `speech` for dialogue or `thought` for an inner voice. Never use jagged, rectangular, explosive, narration, or decorative balloons.
- Keep every complete head, hair silhouette, face, eye, and expression visible. Keep the balloon body, outline, tail or thought dots, Japanese, English, labels, and captions outside every protected head and face zone.
- Generate clean artwork without lettering, balloons, signs, logos, or watermarks. Typeset verified copy only after the art passes review.
- Default to bilingual copy: large Japanese and a small natural English gloss inside the balloon; then one Japanese headline, exactly two Japanese reflection lines, and exactly two English reflection lines below the illustration.
- Use the exact `1009:1536` page ratio or a higher exact multiple. Keep the framed illustration nearly square and reserve its quiet upper band for the balloon.
- Use fictional adult composite characters. Exclude real brands, identifying information, defamatory claims, and unsafe professional guidance.

If any gate fails, shorten the copy, move the balloon, aim its tail toward empty space beside a shoulder, or regenerate the illustration. Never hide a face or make the Japanese uncomfortably small.

## Build the manifest first

1. Define the reader, profession, tone, cast boundaries, section labels, and page count.
2. Draft every premise before image generation. Remove duplicate jokes and vary location, camera angle, pose, hairstyle, clothing color, tools, and emotional beat.
3. Write and proofread the full Japanese-English manifest. Keep each page to one visual setup and one verbal punch line.
4. Record a protected rectangle for every visible head or face, including hair and a small margin.
5. Give every page and balloon a unique ID, descriptive Japanese alt text, and review status.

Apply these copy limits:

- Japanese balloon text: 12–28 characters preferred, 45 maximum, normally two lines;
- English gloss: 2–10 natural words, 60 characters maximum, normally one line;
- Japanese reflection: exactly two short lines;
- English reflection: exactly two natural lines with the same meaning and emotional tone;
- spoken Japanese in the balloon and restrained prose below the art;
- meaning-first translation rather than Japanese word order, romaji, or extra explanation.

## Generate one clean illustration

Use contemporary commercial Japanese anime/manga styling with controlled linework, gentle natural color, believable workplace props, expressive adult characters, and a warm approachable finish. Do not imitate a named living artist.

Reserve the upper 30–34% of the illustration as pale, low-detail negative space. Place every head and face below that band. Request complete heads and useful hands inside the frame. Reject accidental text, malformed focal anatomy, cropped hair, a face in the balloon band, or a composition too similar to an earlier page.

## Validate and compose

Run the bundled compositor first in validation mode, then create the page:

```bash
python3 scripts/compose_single_balloon_page.py \
  --spec page-001.json \
  --validate-only

python3 scripts/compose_single_balloon_page.py \
  --background page-001-art.png \
  --spec page-001.json \
  --output page-001-final.png \
  --font /path/to/a-japanese-capable-font.ttc
```

Require zero validation errors. The script rejects multiple balloons, non-round balloons, wrong page ratios, missing bilingual copy, malformed caption blocks, balloons outside the upper band, and balloon or tail collisions with protected zones.

## Inspect every final page

Inspect the raw illustration and composed page at full size and at about 25% scale. Confirm that:

- the page contains one illustration and one rounded balloon only;
- every complete head and face is unobstructed and comfortably inside the frame;
- Japanese remains the strongest text and the English gloss is readable but secondary;
- no outline, tail, thought dot, letter, label, or caption touches a protected zone;
- line breaks, punctuation, English, category labels, and numbering are correct;
- the artwork contains no generated lettering, real logos, or repeated composition;
- the lower headline and all four reflection lines are present and legible.

Correct the manifest or regenerate the art, then revalidate and reinspect. Do not paint over a failed face collision.

## Assemble a full book

For a Kindle book, apply `references/kindle-book-workflow.md` and the applicable current Kindle/KDP and PDF skills. Keep the cover separate from the interior. Build a fixed-layout EPUB with one XHTML page per visual page, add meaningful alt text, and produce an iPad-readable PDF proof. Verify the complete sequence and perform the final converted-view check in Kindle Previewer or KDP’s online previewer.

Before delivery, confirm unique page IDs, unique final images, complete front and back matter, current publishing-platform requirements, and any required AI-generated-content disclosure.
