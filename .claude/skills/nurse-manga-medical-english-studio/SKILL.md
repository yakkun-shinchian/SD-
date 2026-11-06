---
name: nurse-manga-medical-english-studio
description: Create, revise, and quality-assure bilingual Japanese-English Kindle teaching books that combine nurse-life four-panel comics with practical medical English lessons. Use for nurse manga medical-English books, 10-lesson prototypes, 50-lesson series, general-ward or specialty adaptations, dialogue and explanation design, text-safe comic composition, patient-safety and interpreter checks, iPad review PDFs, fixed-layout EPUBs, covers, KDP metadata, and final publishing packages.
---

# Nurse Manga Medical English Studio

Create a warm, clinically responsible learning book in which a lesson begins with a four-panel comic and is followed by one or more concise medical-English explanation pages. Prefer one explanation page when it remains comfortably readable; automatically continue as `LANGUAGE NOTES 1/2`, `2/2` (or more pages when needed) rather than compressing text. Keep the pages readable in sequence in portrait view.

## Apply defaults without over-questioning

Use these values whenever the user leaves an item blank:

| Field | Default |
| --- | --- |
| Audience | Japanese nurses and nursing students |
| English level | CEFR A2-B1 |
| English variety | American English |
| Conversation partner | English-speaking adult patient |
| Setting | General ward |
| Lessons | 50, organized as five parts of ten |
| Prototype | First 10 lessons |
| Author | YAKUBON STUDIO |
| Series | KAWAII JAPAN COLLECTION |
| Japanese title | 看護師あるある4コマで身につく やさしい医療英会話50 |
| English title | Medical English Through Nurse Life Comics |
| Visual mood | Warm, gentle, lightly humorous, adult professional characters |

Accept overrides for specialty, audience, level, English variety, conversation partner, lesson count, volume, and mood. State applied assumptions once and continue. Ask only when a missing choice would change safety, rights, or the deliverable materially.

## Enforce non-negotiable boundaries

- Treat the book as language education, never as a substitute for clinical judgment, medical interpreting, informed-consent procedures, orders, local manuals, or applicable law.
- Do not make patients, illness, disability, culture, accent, or English ability the joke. Let humor arise from recognizable nursing workflow and kind human misunderstandings.
- Use plain, short, polite patient-facing English. Avoid diagnosis claims, unsafe abbreviations, ambiguous numbers, promises, invented facility procedures, and individualized dosing advice.
- Escalate consent, serious diagnosis or prognosis, surgery, anesthesia, transfusion, resuscitation or code status, acute deterioration, and high-risk medication discussions. Teach a safe handoff phrase and use qualified language support as required by the facility.
- Prefer Teach-Back that checks the explanation, not the patient. Never use Do you understand? as the sole comprehension check.
- Treat simple English as a bridge, not proof that informed understanding has been achieved. Stop and connect to facility-approved language support whenever misunderstanding could affect consent, treatment, medication, urgent care, or discharge safety.
- Use adult nurses and adult patients unless explicitly changed. Exclude real hospital names, company marks, product logos, and recognizable uniforms.
- Plan dialogue space as part of the panel composition. Generate textless art with reserved negative space and either empty rounded balloons or no balloons; draw or refine balloons deterministically during composition. Dialogue may sit inside the illustration when it occupies a planned quiet area and does not cover a protected subject.
- Maintain one canonical lesson-data source. Populate comic text, explanation phrases, answer keys, metadata, and QA records from it instead of retyping.
- Require final human review by a clinically qualified reviewer and an English reviewer before publication.

Read references/medical-safety-language-support-checklist.md before designing any caution or high-risk lesson. Apply Japanese facility rules first; use overseas guidance only as communication-design evidence, not as Japanese law. Verify current claims against primary or official sources whenever clinical, legal, language-access, or KDP guidance may have changed.

## Build in this order

1. **Resolve the brief.** Record user overrides and defaults. Define the deliverable list, page ratio, reading direction, prototype checkpoint, and whether to continue automatically after the first ten.
2. **Create the project scaffold.** Run `python3 scripts/init_project.py PROJECT_DIR` and apply any user overrides. This creates canonical lesson data, KDP metadata, a source-verification record, and lesson-count-matched duplication, visual/text, and medical/language-safety registers. Never edit the bundled templates as project files.
3. **Map the curriculum.** Start from references/default-50-curriculum.md or rebuild an equivalent five-part progression. Complete the generated duplication register before scripting. Repeat reusable language patterns intentionally while keeping every title, scene, learning goal, complete dialogue sequence, explanation, character staging, expression, composition, and visual signature distinct.
4. **Design canonical lessons.** Use references/lesson-design-template.md and the generated `lesson-pack.json`. Give every balloon a stable ID. Reference those IDs from the explanation rather than copying phrases into a second field.
5. **Write the language.** Keep each balloon utterance speakable in one breath. Put English first and Japanese directly below it. Use two or three required phrases, three to five vocabulary items, one grammar pattern, one junior-high-English bridge, two substitutions, one common error, an optional safety note, and one mini exercise.
6. **Produce the ten-lesson prototype.** Create textless four-panel art, compose accurate text, pair each comic page with its explanation page, and make an iPad review PDF. If the user supplied an established visual reference or explicitly asked for uninterrupted completion, run the internal gate and continue; otherwise request visual approval before producing the remaining forty.
7. **Compose, do not redraw text.** Follow references/manga-page-template.md. Prefer illustration-integrated balloons in planned background space rather than automatically moving all dialogue below or outside the artwork. Use the image-generation skill for art and the PDF skill for review files. Preserve source art and editable text layers, then flatten a publication copy only after proofreading.
8. **Explain consistently.** Follow references/medical-english-explanation-template.md. Use patient-friendly terms before professional terminology and note meaningful US-UK differences only when relevant.
9. **Flow-layout every explanation.** Never assign fixed Y coordinates or fixed content heights to numbered sections. Measure wrapping and actual line height, advance from the preceding block's bottom edge, and paginate before the bottom safe margin. Use `scripts/build_language_notes.py` for a canonical pack or implement its same measured-flow contract.
10. **Run gates.** Apply references/visual-quality-checklist.md and references/medical-safety-language-support-checklist.md to every prototype lesson. Run `scripts/validate_lesson_pack.py` on the canonical JSON. For explanation pages, require zero text overlap, clipping, out-of-bounds text, missing text, section overlap, heading/body overlap, body/body overlap, and bottom overflow. Correct all errors and review every warning. Do not mark a visual or semantic item as passed solely because automation found no problem.
11. **Complete the remaining lessons.** Preserve style, resolution, color, character maturity, and text scale. Recheck later pages in batches rather than assuming quality remains stable.
12. **Package the book.** Follow references/kindle-output-workflow.md. Produce the fixed-layout EPUB, cover JPEG, iPad review PDF, KDP metadata sheet, and ordered ZIP. Validate the exact files intended for upload.

## Use the two-page lesson contract

### Page A — four-panel comic

- Show exactly four clearly ordered panels inside a dark outer frame.
- Use rounded or oval balloons fully inside each panel.
- Reserve balloon zones before drawing characters. Use walls, ceilings, curtains, floors, or other quiet background space so dialogue feels integrated with the illustration.
- Treat faces, eyes, mouths, head and hair outlines, hands, action-relevant limbs, patient identifiers, medication labels, tubes, monitors, and other clinically meaningful objects as protected regions. Keep balloons, tails, and text outside those regions with visible clearance.
- A balloon may sit beside a face or over non-critical background, but never across a facial contour. Do not solve collisions by shrinking type or by placing every balloon in a detached row outside the comic.
- Keep the full head and limbs visible; do not crop hands when they perform a clinical action.
- Place English prominently and its faithful Japanese translation immediately below.
- Limit dialogue to the minimum needed for the learning goal.

### Page B onward — explanation

Include these nine blocks in this order:

1. 今日の会話目標
2. 今日の必修フレーズ（2-3）
3. 重要単語・イディオム（3-5）
4. 文法・会話パターン（1）
5. 中学英語が病棟ではこう使われる（1）
6. 単語を入れ替える応用例（2）
7. 不自然な直訳・よくある間違い（1）
8. 必要な場合のみ患者安全・通訳利用の注意
9. ミニ練習（1問）

Do not squeeze text to make an overfilled page pass. Keep body type at least 14 pt equivalent, section headings at least 18 pt equivalent, body line height between 1.25 and 1.45 times the font size, and section gaps at least 0.6 times the body font size. Shorten only when meaning is fully preserved; otherwise add an explanation continuation page.

Before rendering each section, calculate its text width, font, size, wrapping, line count, line height, and required height. The next section starts only after the previous body and section gap. Wrap English by word and Japanese by character with basic kinsoku handling. Record every text block's `(x, y, width, height)` and reject any unintended positive-area intersection or safe-area violation. Rasterize all explanation pages for visual inspection after automated QA.

## Validate the canonical pack

Create a new reusable project package:

    python3 scripts/init_project.py path/to/project

Use `--lessons`, `--prototype`, `--specialty`, `--audience`, `--cefr`, `--english-variety`, `--conversation-partner`, `--volume`, and `--mood` only when the brief overrides defaults. Complete the generated files, then run:

    python3 scripts/validate_lesson_pack.py path/to/lesson-pack.json

Before release, run:

    python3 scripts/validate_lesson_pack.py path/to/lesson-pack.json --release

Use `--report path/to/validation-report.txt` to save the result. Treat an error as a stop condition. Review every warning deliberately and record the disposition. `--release` additionally requires final QA fields and both human reviews to be approved. Automated checks do not replace clinical, language, or visual human review.

## Deliver a complete publishing package

Return, at minimum:

- editable canonical lesson data and completed duplication register
- source and final page images, sequentially named
- ten-lesson prototype PDF and final iPad review PDF
- fixed-layout EPUB and its validation report
- cover JPEG
- KDP metadata sheet with Japanese, reading, romanization, English description, seven keywords, categories, author, series, volume, and edition
- completed visual QA and medical/language-safety sign-off
- a short source-verification record with access dates for current KDP, clinical-communication, and language-support guidance used
- one ordered ZIP containing upload files and review records

Never claim publication readiness while a required human review is pending, Kindle Previewer shows a blocking issue, or the upload files differ from the reviewed files.

## Load only the needed resource

- Curriculum planning: references/default-50-curriculum.md
- Lesson data and scripting: references/lesson-design-template.md
- Comic artwork and composition: references/manga-page-template.md
- Explanation writing: references/medical-english-explanation-template.md
- Visual and text QA: references/visual-quality-checklist.md
- Clinical risk, Teach-Back, and interpreter decisions: references/medical-safety-language-support-checklist.md
- Acute handoff or SBAR lessons: references/sbar-handoff-for-novice-nurses.md
- EPUB, PDF, cover, metadata, and ZIP: references/kindle-output-workflow.md
- New-project data files: scripts/init_project.py and assets/*.template.*
- Canonical data validation: scripts/validate_lesson_pack.py
- Flow-layout explanation rendering and bounding-box QA: scripts/build_language_notes.py
