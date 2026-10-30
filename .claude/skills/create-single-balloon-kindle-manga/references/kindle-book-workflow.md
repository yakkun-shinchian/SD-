# Kindle book workflow for Part 2 manga

Read this file when the user requests a complete Kindle book, EPUB, cover, submission package, or iPad PDF preview.

## Plan the book before generating art

1. Fix the title, subtitle, series name, author or imprint, reader, tone, and page count.
2. Divide the ideas into useful sections. For a two-profession book, balance the count unless the user requests another split.
3. Draft all premises and bilingual copy first. Remove duplicates, weak variants, and jokes that depend on identifying or humiliating a real person.
4. Arrange the sequence for recognition, escalation, relief, and a warm ending.
5. Maintain a collection manifest containing page ID, section, category, premise, raw-art path, final-page path, alt text, and review state.

## Recommended interior sequence

- title page;
- short introduction;
- section divider;
- Part 2 comic pages, one visual page each;
- additional section dividers as needed;
- short afterword;
- copyright and publishing information.

Keep the ebook cover separate from the interior. Do not insert the retail cover as the first interior page unless the user explicitly requests that treatment.

## Produce and verify every page

1. Generate a unique unlettered source illustration for every comic page.
2. Record all head and face protection zones.
3. Validate every JSON manifest with `scripts/compose_single_balloon_page.py --validate-only`.
4. Compose every final page at `1009x1536` or a higher exact multiple.
5. Render a contact sheet and inspect the full collection for repeated faces, poses, props, color schemes, and layouts.
6. Inspect every page at full size and reduced preview size.
7. Hash raw and final images to detect exact duplicates.

## Build the Kindle edition

- Use a supported fixed-layout EPUB workflow with one XHTML document per visual page.
- Set the reading direction requested by the user; use left-to-right for this vertically composed bilingual format unless specified otherwise.
- Add meaningful Japanese alt text to every interior image.
- Keep CSS, image dimensions, spine order, navigation, language metadata, title metadata, and cover metadata internally consistent.
- Validate the EPUB structure and reopen the built file before delivery.
- Run the final converted-view inspection in Kindle Previewer or KDP’s online previewer.

Publishing requirements change. Before packaging, verify current official KDP guidance for supported manuscript formats, cover dimensions and color mode, pricing, delivery costs, accessibility, and AI-generated-content disclosure. Do not rely on remembered platform rules.

## Build the proof package

Provide, when requested:

- fixed-layout EPUB;
- separate retail cover image;
- iPad-readable PDF proof containing the cover and all interior pages;
- ZIP of individual comic page images;
- submission sheet with metadata and upload choices;
- quality report listing validation results and any remaining manual preview step.

Render the PDF with a reliable PDF workflow and inspect the latest page images. Confirm no clipping, text overlap, broken Japanese glyphs, unexpected blank pages, or zero-byte outputs.

## Final collection gate

Do not call the book ready until:

- every comic page contains one illustration and one rounded balloon only;
- every face and full head is unobstructed;
- all Japanese-English copy is complete and proofread;
- page IDs, numbers, images, and spine entries are unique and ordered;
- front matter, section transitions, afterword, and copyright page are complete;
- cover and interior files meet the current platform requirements;
- the final EPUB and PDF both reopen successfully;
- the remaining Kindle Previewer or KDP online-preview step is stated honestly if it cannot be performed in the current environment.
