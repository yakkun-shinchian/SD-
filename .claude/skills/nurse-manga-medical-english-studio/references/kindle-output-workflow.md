# Kindle output workflow

Use this workflow after content and visual gates pass. Check the current official KDP pages at the start of every production run and record the access date; formats and preview behavior can change.

## 1. Freeze the source

- Lock canonical lesson JSON, final page order, title, volume, author, and series.
- Complete the generated `review/source-verification.csv` after checking the current official pages; record access dates, decisions, and where each source affected the book.
- Export sequential page files with zero-padded names.
- Keep textless art and editable composition sources separately from flattened publication pages.
- Record dimensions, color space, fonts, and final file hashes.

## 2. Build the page sequence

Use this order unless the user changes it:

1. cover supplied separately for KDP
2. title page
3. copyright and educational-safety disclaimer
4. how to use this book
5. contents
6. lessons, with comic A immediately followed by explanation B
7. mini-practice answer key
8. afterword and language-support reminder
9. author, series, and colophon

Pair A/B pages as left/right synthetic spreads only when the chosen reading direction and current KDP guidance support the pairing. Verify portrait order separately.

## 3. Create the fixed-layout EPUB

- Use EPUB fixed-layout metadata and declare the original design resolution in the OPF according to the current official guide.
- Set writing mode and page-progression direction deliberately. Default to horizontal left-to-right for this bilingual textbook unless the user requests Japanese right-to-left manga reading.
- Mark comic content appropriately and define page-spread properties consistently when using synthetic spreads.
- Use the same approved flattened page images that were reviewed in the PDF. Keep source images in sRGB and preserve sufficient resolution for magnification.
- Provide navigation, a cover reference, language metadata, title, creator, identifier, and alt text or accessible summaries appropriate to the format.
- Do not include obsolete MOBI output. KDP states that MOBI support for fixed-layout eBooks ended on March 18, 2025; recheck the current supported-format page before each release.
- Run EPUBCheck or an equivalent EPUB structural validator, then Kindle Previewer. Resolve every blocking error and inspect warnings.

KDP's fixed-layout guide identifies layout, original resolution, writing mode for relevant reading directions, page-spread properties for paired pages, and comic book type as key metadata. Copy current values from the official guide rather than from memory.

## 4. Create the iPad review PDF

- Use the exact final page images and sequence intended for EPUB.
- Preserve the 1009:1536 page ratio unless the project brief overrides it.
- Embed all fonts when the PDF is not image-flattened.
- Test page-by-page at 100% on iPad in portrait and paired landscape views.
- Check later pages, not only the first ten and thumbnail overview.

## 5. Create the cover JPEG

- Match title, subtitle, volume, author, and series exactly to the metadata sheet.
- Keep the title readable at thumbnail size and avoid clinical claims or real logos.
- Verify the current KDP cover dimensions, color, and file requirements before export; do not hardcode an old specification into the project.

## 6. Complete KDP metadata

Include:

- Japanese title, reading, and romanization
- subtitle in the same three forms
- English title and English description
- author or pen name: YAKUBON STUDIO unless changed
- series: KAWAII JAPAN COLLECTION unless changed
- volume, edition, language, and publishing rights
- concise Japanese and English descriptions that identify the educational level and safety boundary
- seven non-duplicative search keywords
- accurate categories chosen from the current KDP interface
- AI-content disclosure answers based on the actual production method and current KDP questions

## 7. Validate the exact upload set

- Open the EPUB in current Kindle Previewer and inspect representative phone, tablet, and e-reader views when available.
- Confirm comic A and explanation B pairing in landscape and sequence in portrait.
- Check magnification or Guided View behavior if used.
- Compare the EPUB-rendered pages against the approved PDF.
- Recheck cover and metadata character-for-character.
- Ensure the final clinical and English human sign-offs are approved.

## 8. Package the ZIP

Use an ordered structure such as:

    01_UPLOAD/fixed-layout.epub
    01_UPLOAD/cover.jpg
    02_REVIEW/iPad-review.pdf
    02_REVIEW/validation-report.txt
    03_METADATA/kdp-metadata.*
    04_SOURCE/lesson-pack.json
    04_SOURCE/duplication-check.csv
    05_QA/visual-qa.csv
    05_QA/medical-language-signoff.*

Do not place obsolete drafts in the upload folder. Generate the ZIP after all files are final, then verify its contents and hashes.

## Current official KDP reference points

- [Creating fixed-layout books with image pop-ups or Virtual Panels](https://kdp.amazon.com/en_US/help/topic/G9GSTY4LTRT39D4Z)
- [Prepare comic and kids' eBooks with Kindle Create](https://kdp.amazon.com/en_US/help/topic/GJMRD9F78MS9F43R)
- [Supported eBook manuscript formats](https://kdp.amazon.com/en_US/help/topic/G200634390)
- [MOBI support for eBooks FAQ](https://kdp.amazon.com/en_US/help/topic/GULSQMHU5MNH4EZM)
- [eBook cover image criteria](https://kdp.amazon.com/en_US/help/topic/G200645690)

These links were last checked while authoring this skill on 2026-08-23. Recheck them and record a new access date for every production run.
