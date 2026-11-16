# Visual and text quality checklist

Complete the page-level gate for every page and the book-level gate for every prototype and final package. Record pass, fail, not applicable, reviewer, and date; never use a blank cell as approval.

## Page A — comic

- [ ] Exactly four panels appear in the intended reading order.
- [ ] The image-generation output contains no letters, numbers, pseudo-text, logo, watermark, or patient identifier.
- [ ] Every speech balloon is rounded, fully inside its panel, and has comfortable inner padding.
- [ ] Balloon placement uses planned negative space inside the illustration where practical; dialogue has not been moved into a detached outside row merely to avoid composition work.
- [ ] No balloon, tail, or text touches or crosses a face, eye, mouth, head or hair outline, hand, action-relevant limb, medication label, tube, line, monitor, mobility aid, or important clinical object.
- [ ] Every protected region has visible clearance at 100% view; adjacency is acceptable, intersection is not.
- [ ] Heads, faces, hands, and action-relevant limbs are complete and anatomically plausible.
- [ ] The adult nurse looks professionally adult rather than childlike.
- [ ] Clinical equipment and actions are not misleading, reversed, disconnected, or unsafe.
- [ ] English is larger than Japanese but both remain readable at iPad 100% view.
- [ ] English and Japanese line breaks preserve negatives, numbers, units, time, and meaning.
- [ ] Dialogue equals the canonical balloon text; no manual rewording occurred during composition.
- [ ] Contrast remains strong in color, grayscale, and a dim-screen check.
- [ ] Export dimensions, color profile, and compression match the project standard.

## Page B — explanation

- [ ] Blocks 1-7 and 9 appear in order; block 8 appears in the same position whenever a safety note is needed.
- [ ] Required phrases resolve from canonical balloon IDs and therefore match the comic exactly.
- [ ] Japanese translations preserve the English meaning without adding a clinical claim.
- [ ] Vocabulary has three to five useful entries rather than dictionary clutter.
- [ ] One grammar pattern and one junior-high-English bridge are clearly identified.
- [ ] Two substitutions preserve the pattern and remain natural.
- [ ] The common-error example is plausible and the preferred version is safe.
- [ ] The mini exercise has one clear task and one stored model answer.
- [ ] Nothing is clipped, crowded, or reduced below the established body-text scale.
- [ ] No mojibake, missing glyph, orphan line, or awkward automatic hyphenation appears.

## Book-level duplication and consistency

- [ ] Lesson numbers and page names are continuous and correctly paired A/B.
- [ ] No duplicate title, scene key, full dialogue sequence, or visual signature exists.
- [ ] Intentional language-pattern repetition is documented as spaced practice.
- [ ] Character design, expression, location, camera angle, and props vary across lessons.
- [ ] Perceptual-image comparison finds no repeated or near-repeated page art.
- [ ] Pages 31-50 receive the same resolution and close visual inspection as pages 1-10.
- [ ] Font family, hierarchy, frame geometry, margins, colors, and balloon style are consistent.
- [ ] Prototype fixes are propagated to later pages and rechecked on the prototype itself.

## Output integrity

- [ ] Every interior page keeps the approved 1009:1536 design ratio unless the project brief records an override.
- [ ] The iPad PDF opens, scrolls, zooms, and displays Japanese and English correctly.
- [ ] Landscape view pairs comic A on the left with its explanation B on the right.
- [ ] Portrait view preserves correct sequential order.
- [ ] EPUB, PDF, page images, and ZIP use the same approved page files.
- [ ] Cover title, subtitle, volume, author, and series match the metadata sheet.
- [ ] File hashes are recorded after approval; no post-review edits remain unverified.
- [ ] A human has reviewed the final PDF at 100%, not only thumbnails.

Record the reviewer, review date, and corrective note in the generated `visual-text-qa-register.csv`. Blank cells mean unreviewed, never passed.

## Failure rule

Repair and rerun the complete page gate after any change. A single overlap, truncated negative, wrong patient identifier, text mismatch, repeated page, or unresolved clinical-safety issue blocks release.
