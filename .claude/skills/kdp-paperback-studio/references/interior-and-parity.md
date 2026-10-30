# Interior and facing-page workflow

## Use a print page map

Create a manifest with at least:

| Field | Meaning |
| --- | --- |
| `page_id` | Stable identifier, not only a changing page number |
| `page_type` | title, copyright, introduction, chapter, image, caption, afterword, blank |
| `work_id` | The image/caption pair identifier |
| `source_asset` | Image or source-layout path |
| `intended_side` | left, right, either |
| `visible_number` | Printed number or omitted |
| `blank_reason` | Required whenever `page_type` is blank |
| `review_status` | pending, pass, revise |

## Understand parity

For a left-to-right paperback:

- page 1 is a right-hand recto page;
- odd pages are on the right;
- even pages are on the left;
- a visible spread is `(even page, following odd page)`.

Therefore, for `image-left / caption-right`, place the image on an even page and its caption on the following odd page. For `caption-left / image-right`, reverse the content roles while preserving even-left and odd-right.

If every image is followed by its caption on the reverse side of the same sheet, the whole repeated sequence is one page out of parity. Prefer one documented blank before the first repeated pair, or relocate an existing final blank there, then recheck every later chapter. This is safer than manually swapping dozens of pairs.

For right-to-left binding, reverse the visible positions and validate with an RTL spread preview.

## Keep front matter intentional

- Treat the title page, copyright, introduction, and chapter openers as part of pagination even when their page numbers are hidden.
- Use blank pages only to create a deliberate recto start or correct the repeated spread pattern.
- Do not leave an unexplained blank with a page-number patch or mismatched background.
- After moving a blank, correct displayed page numbers and references.

## Create the upload interior

- Export single pages, not two-up spreads.
- Use the selected trim size for no-bleed interiors.
- If any interior page bleeds, use the current KDP full-bleed page dimensions for the entire file and extend art beyond trim.
- Use mirrored inside/outside margins. Recalculate the inside margin after page count changes.
- Keep body text comfortably above the official minimum; do not rely on a zoomed preview to judge physical readability.
- Embed all fonts. Render representative pages and inspect Japanese glyphs, ligatures, and punctuation.
- Inspect effective image PPI at placed size. Upscaling metadata does not restore missing detail.

## Diagnose a KDP spread proof

1. Confirm whether the supplied PDF is a KDP proof with grey surround, crop marks, or a `Proof` page.
2. Identify the actual trim rectangle and logical single pages.
3. Map each image to its matching caption by content, not by proximity alone.
4. Check whether one parity shift corrects all repeated pairs and chapter openings.
5. Rebuild a clean single-page interior without grey surround, crop marks, or proof labels.
6. Re-render the rebuilt PDF as spreads and inspect the entire sequence.

Do not silently discard content to make page count even. Move or add an intentional blank and document it.

