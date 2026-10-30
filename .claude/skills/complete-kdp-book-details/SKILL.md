---
name: complete-kdp-book-details
description: Create and validate the complete copy-ready Amazon KDP book-details pack for a Kindle book. Use whenever a Kindle/KDP title is being completed, assembled, preflighted, packaged, or handed off, and whenever the user asks for a book title, title furigana, title romaji, subtitle, subtitle furigana, subtitle romaji, description, seven KDP keywords, author/imprint forms, categories, AI disclosure, accessibility, pricing notes, or upload filenames. Automatically add KDP_BOOK_DETAILS.md to every finished Kindle project.
---

# Complete KDP Book Details

Create one authoritative `KDP_BOOK_DETAILS.md` that can be copied into KDP without rediscovering decisions.

## Workflow

1. Read the actual cover, EPUB metadata, manuscript, production manifest, and submission sheet when available.
2. Treat the actual files as authoritative. Flag differences instead of silently inventing a reconciliation.
3. Copy `assets/KDP_BOOK_DETAILS_TEMPLATE.md` into the project output and complete every field.
4. Write the title and subtitle in three forms:
   - display form exactly matching cover and EPUB;
   - katakana furigana with natural word boundaries and spoken readings for numerals;
   - readable plain-ASCII romaji, preserving established English words and acronyms.
5. Use the standard creator identity unless the user explicitly specifies another:
   - display: `YAKUBON STUDIO`
   - furigana: `ヤクボン スタジオ`
   - romaji: `YAKUBON STUDIO`
   - imprint/label: the same three forms.
6. Write one paste-ready Japanese description. For a bilingual or overseas-facing book, also add a natural English description.
7. Fill exactly seven distinct keyword boxes. Use reader search intent, not comma-stuffed lists or competitor names.
8. Complete categories, rights, AI-generated-content disclosure, accessibility, reading direction, pricing decision, KDP Select decision, and exact upload filenames from the production record.
9. Run `scripts/validate_kdp_book_details.py KDP_BOOK_DETAILS.md`. Fix every error.
10. Put the validated file in both the final project folder and the complete archive. Keep one authoritative version.

## Metadata rules

- Match title, subtitle, series, volume, author, imprint, language, and reading direction across the cover, EPUB, PDF, filenames, and KDP fields.
- Keep furigana in katakana. Read numbers naturally: `60` becomes `ロクジュウ` when it is part of Japanese prose.
- Use Hepburn-style readable romaji without macrons for form-entry compatibility. Do not romanize an established English phrase such as `KAWAII AT WORK` into Japanese phonetics.
- If no subtitle exists, propose one before final export. Do not call the pack upload-ready until the chosen subtitle also appears in the cover and EPUB metadata.
- Write descriptions with a short hook, the book's concrete contents, its emotional or practical promise, intended readers, and an honest closing line. Avoid unsupported sales rankings, medical claims, urgency, or reviews.
- Make each keyword field a useful phrase, usually two to five terms. Avoid duplicating the title, author, other keyword boxes, categories, trademarks, or misleading claims.
- Suggest up to three current category candidates, but verify the live KDP choices at submission because category labels can change.
- Derive AI and accessibility declarations from the actual production record and EPUB alt attributes. Never guess.
- State prices and royalty choices as dated proposals until verified against the current marketplace terms.
- Do not upload files, enroll in KDP Select, or publish from this skill.

## Completion gate

Do not declare a Kindle project complete unless:

- `KDP_BOOK_DETAILS.md` exists and passes the validator;
- title and subtitle have display, furigana, and romaji forms;
- the description is paste-ready and free of placeholders;
- all seven keyword boxes are filled once;
- author and imprint use the approved identity;
- metadata matches the final cover and EPUB;
- upload filenames identify the exact final EPUB and cover JPEG;
- AI, accessibility, rights, price, royalty, and Select decisions are recorded;
- the file is included in the final archive.

