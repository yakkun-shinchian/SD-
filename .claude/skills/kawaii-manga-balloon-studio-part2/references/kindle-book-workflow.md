# Kindle book workflow for Part 2 manga

Read this file for a complete Kindle book, fixed-layout EPUB, cover, submission package, or iPad PDF proof.

## Plan before generating art

1. Fix the title, subtitle, series name, author or imprint, reader, tone, and page count.
2. Divide ideas into useful sections and balance categories unless the user requests another distribution.
3. Draft every four-beat premise and all bilingual copy first. Remove duplicates and weak variants.
4. Arrange the sequence for recognition, escalation, relief, and a warm ending.
5. Maintain a manifest with page ID, section, premise, raw panel-sheet path, final-page path, alt text, and review state.

## Recommended interior sequence

- title page;
- short introduction;
- section divider;
- Part 2 manga pages, one portrait visual page each;
- additional section dividers as needed;
- short afterword;
- copyright and publishing information.

Keep the retail cover separate from the interior unless the user explicitly requests otherwise.

## Produce and verify every page

1. Generate one unique unlettered square four-panel sheet for each manga page.
2. Record all panel rectangles and every head/face protection zone.
3. Validate each JSON manifest with `scripts/compose_single_balloon_page.py --validate-only`.
4. Compose each portrait page at `1009x1536` or a higher exact multiple.
5. Inspect a contact sheet for repeated faces, poses, props, colors, camera angles, and jokes.
6. Inspect every page at full size and reduced mobile-preview size.
7. Hash raw and final images to detect exact duplicates.

Every spoken line must remain in a round bilingual balloon. Every balloon, outline, tail, and letter must stay inside one rectangular panel and outside every protected face/head zone.

## Build the Kindle edition

- Use a supported fixed-layout EPUB workflow with one XHTML document per portrait visual page.
- Use left-to-right reading for this vertically composed bilingual format unless the user requests otherwise.
- Add meaningful Japanese alt text to every interior image.
- Keep CSS, image dimensions, spine order, navigation, language metadata, title metadata, and cover metadata consistent.
- Validate the EPUB structure and reopen the built file before delivery.
- Run the final converted-view inspection in Kindle Previewer or KDP's online previewer.

Publishing requirements change. Before packaging, verify current official KDP guidance for manuscript formats, cover specifications, pricing, accessibility, and AI-generated-content disclosure.

## Proof package

When requested, provide:

- fixed-layout EPUB;
- separate retail cover image;
- iPad-readable PDF proof containing all interior pages;
- ZIP of individual final manga pages;
- submission sheet with metadata and upload choices;
- quality report listing validation results and any remaining manual preview step.

Inspect the rendered PDF and EPUB. Confirm no clipping, broken Japanese glyphs, text overlap, missing balloons, unexpected blank pages, or zero-byte outputs.

## Final collection gate

Do not call the book ready until:

- every manga page follows the rectangular panel map;
- every spoken line uses a smooth round bilingual balloon;
- every balloon and tail stays inside its assigned panel;
- every face and complete head is unobstructed;
- all Japanese-English copy is complete and proofread;
- page IDs, numbers, art, and spine entries are unique and ordered;
- front matter, transitions, afterword, and copyright page are complete;
- the final EPUB and PDF reopen successfully;
- any remaining Kindle Previewer or KDP online-preview step is stated honestly.
