# Visual-book production checklist

## Page manifest fields

| Field | Purpose |
|---|---|
| `page_id` | Stable number such as `JP-001` |
| `section` | Region, theme, or chapter |
| `subject` | Person, garment, object, or scene |
| `culture_region` | Specific community and geography |
| `era_occasion` | Period and everyday/ceremonial context |
| `visual_prompt` | Versioned prompt text |
| `negative_constraints` | Unwanted artifacts and stereotypes |
| `caption` | Final short text |
| `fact_sources` | URLs or citations supporting the caption |
| `asset_status` | planned / generated / revised / approved |
| `rights_status` | cleared / original / needs review |
| `qa_notes` | Visual and factual corrections |

## Manga page manifest extension

Add these fields for every comic, manga, or dialogue-led illustrated page:

| Field | Purpose |
|---|---|
| `page_mode` | `reflective` or `instructional` |
| `layout_preset` | One to four bordered-panel preset; default `hero-plus-three` |
| `style_contract` | Rounded balloons, `ja-then-en`, zero face intersection, reject-and-recompose |
| `panels[].balloons[].text_ja` | Proofread Japanese main dialogue |
| `panels[].balloons[].text_en` | Natural English companion placed below Japanese |
| `panels[].balloons[].language_order` | Must be `ja-then-en` |
| `face_safety.face_regions` | Every visible face, including background people, in normalized coordinates |
| `face_safety.text_regions` | Balloons, glyphs, tails, numbers, labels, and captions |
| `face_safety.manual_100_percent_check_passed` | Source page passes full-size inspection |
| `face_safety.pdf_epub_render_check_passed` | Rendered PDF/EPUB passes the second collision inspection |

Reject the page when any balloon fill, outline, Japanese or English glyph, tail, panel number, label, or caption intersects an expanded face region. Do not mark a page approved while either review flag is false.

## Source and policy links

- KDP content and AI disclosure guidance: https://kdp.amazon.com/help/topic/G200672390
- Kindle manuscript formatting: https://kdp.amazon.com/help?topicId=G200645680
- Kindle publishing guidelines: https://kdp.amazon.com/help/topic/GU72M65VRFPH43L6
- KDP intellectual-property FAQ: https://kdp.amazon.com/help/topic/G200672400
- Cover criteria: https://kdp.amazon.com/help/topic/G200645690

Re-check these pages at finalization because requirements can change.

## Caption verification

- Prefer museum, cultural institution, government, UNESCO, academic, or community sources.
- Record disagreement over names or ownership rather than forcing a single claim.
- Avoid saying “the traditional dress of country X” when the garment belongs to a specific region or people.
- State whether the depicted styling is historical, contemporary, ceremonial, bridal, festival, or interpretive.

## Final export checks

- Correct dimensions, bleed, margins, color handling, and image resolution for the selected format.
- Cover not duplicated inside a reflowable manuscript unless intentionally required.
- Working navigation and table of contents where applicable.
- Embedded fonts or rasterized text handled according to the current KDP format rules.
- No personal or licensed source files unintentionally included in the deliverable.
- Every manga balloon remains rounded, contains Japanese followed by readable English, and stays completely clear of every face after export.
- The iPad review PDF has been inspected as a contact sheet and at 100% zoom after the latest change.
