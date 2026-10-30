# KDP publishing handoff

Use this workflow to reduce KDP submission to verification rather than rediscovery.

## 1. Build one authoritative submission pack

Create a clearly named folder for each volume containing only the applicable files:

- `*_ebook.epub`: Kindle manuscript
- `*_ebook_cover.jpg`: Kindle storefront cover
- `*_print_interior.pdf`: paperback or hardcover interior
- `*_print_cover.pdf`: full print cover including back, spine, and bleed
- `*_preview.pdf`: local review only; never substitute it for the EPUB unless the selected KDP format explicitly requires PDF
- `KDP_SUBMISSION_SHEET.md`: exact copy-paste metadata and decisions
- `*_KDP_PACKAGE.zip`: storage and transfer only; do not upload the ZIP as the manuscript

Copy `assets/kdp-submission-sheet-template.md` and complete it. Mark unfinished or checkpoint files plainly and keep them outside the upload-ready folder.

## 2. Preflight actual files

Run:

```bash
python3 scripts/kdp_preflight.py \
  --epub /absolute/path/book.epub \
  --cover /absolute/path/cover.jpg \
  --expected-title "Exact title" \
  --expected-author "Exact author" \
  --expected-language en
```

Treat the report as evidence. Resolve every error before KDP upload.

- Match KDP Book Details language to EPUB `dc:language`. For bilingual books, verify the dominant language against current KDP guidance; do not use the storefront country as the language.
- Match left-to-right or right-to-left selection to the EPUB spine and content.
- Match title, subtitle, series, author, and imprint exactly across cover, interior, EPUB metadata, print files, and KDP fields.
- Determine accessibility from actual `alt` attributes. Never select “all images” without inspecting the EPUB.
- Verify cover format, pixel dimensions, color mode, aspect ratio, and file size.
- Run EPUBCheck and the KDP previewer after the structural preflight.

## 3. Generate the form-entry sheet

Order the sheet exactly like KDP:

1. Details: language, title, subtitle, series, author, description, rights, audience, marketplace, categories, keywords.
2. eBook content: reading direction, EPUB, DRM decision, cover JPG, AI disclosure, accessibility, preview, optional ISBN and imprint.
3. eBook pricing: territories, marketplace, royalty plan, KDP Select decision, per-market price, delivery cost, estimated royalty.
4. Print details: ISBN source, publication date, trim, bleed, paper/ink, reading direction.
5. Print content: interior PDF, full cover PDF, preview and spine checks.
6. Print pricing: marketplaces, list prices, printing costs, and estimated royalties.

Provide copy-ready values rather than prose explanations beside every field.

## 4. Make declarations from the production record

- If AI created the actual text, images, or translation, declare it as AI-generated even after editing. Record the user-facing tool name actually used, such as `ChatGPT`.
- If AI only brainstormed or proofread human-created content, classify it according to the current KDP distinction between generated and assisted content.
- After any new manuscript or cover upload, re-check every declaration-confirmation box that KDP resets.
- For accessibility, report the number of images, missing or empty alt text, and descriptions beyond the current recommended length.

## 5. Calculate pricing per marketplace

Browse current official KDP pricing and royalty pages immediately before submission. Price bands, delivery-cost rules, and program terms can change.

- Do not equate selecting the 70% radio button with receiving 70% in every marketplace.
- Show the KDP table's effective rate and royalty for the primary marketplace.
- Explain KDP Select separately from the royalty-plan selector. In marketplaces where Select is required for 70%, verify enrollment before promising 70%.
- Explain the current digital-exclusivity period before selecting KDP Select. Never enroll silently.
- Compare 35% and 70% after tax and delivery costs. Image-heavy books can make the difference small in marketplaces with per-megabyte delivery fees.
- Keep print pricing separate because print royalties subtract manufacturing cost rather than digital delivery cost.

## 6. Assist with the live KDP form

When the user explicitly asks to use KDP in the browser:

1. Load and follow the browser-control skill.
2. Reuse a signed-in session only after observing it; the user handles credentials and security challenges.
3. Verify the exact title/account, marketplace, files, metadata sheet, price, royalty plan, and Select decision.
4. Fill reversible fields and upload the exact authorized files.
5. Wait for processing and inspect visible errors instead of repeatedly uploading.
6. Open the previewer and record issues.
7. Stop before `Publish`, `Save and Publish`, or an equivalent final public action. Confirm the exact title, formats, prices, territories, Select/exclusivity decision, and files immediately before clicking.

## 7. Troubleshooting playbook

| KDP symptom | First check | Usual correction |
|---|---|---|
| Manuscript language mismatch | EPUB `dc:language` versus Book Details language | Change the Book Details language or rebuild the EPUB; then resubmit |
| Wrong reading direction | EPUB spine and page design | Select the matching direction or rebuild |
| Generic cover error | Processing status, JPEG/PDF type, dimensions, RGB/CMYK, file size | Wait for processing, validate, then retry once with the correct cover file |
| 70% selected but marketplace shows 35% | Market eligibility, price band, Select enrollment | Correct the missing eligibility condition; trust the marketplace row |
| Accessibility choice is unclear | EPUB image `alt` attributes | Select none/some/all from the measured result |
| AI section blocks continuation | Required category choices, tool names, reset confirmation box | Complete each generated-content category and reconfirm after upload |
| Only the cover appears on the Mac | Download location and package contents | Provide one verified ZIP plus individual links; unpack before KDP upload |
| Paperback preview flags margins or cover | Trim, bleed, page count, spine width, cover template version | Re-export interior and full cover against the current template |

## 8. Definition of done

Do not say the submission is ready until:

- eBook and print files are unambiguously named;
- the submission sheet is complete;
- preflight and EPUBCheck pass;
- KDP preview is reviewed for both formats;
- language, metadata, AI, accessibility, pricing, royalty, and rights decisions agree;
- the user has made the final publication decision.

