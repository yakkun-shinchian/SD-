# Manga page template

## Page system

- Use a portrait design ratio of 1009:1536 by default. Treat this as the studio design standard, not a universal KDP requirement.
- Render and retain an editable master at two times the final pixel dimensions or higher when the tool allows it.
- Use sRGB. Keep color, line weight, and compression stable from the first lesson through the last.
- Pair comic page A on the left and explanation page B on the right in landscape-facing view. Preserve ordinary sequential reading in portrait view.
- Use the same frame geometry across a volume. Vary camera angle, staging, expressions, props, and movement rather than moving the reading order.

## Default four-panel geometry

Use a dark rectangular outer frame with generous safe margins. Place one wide establishing panel first, followed by three equally sized panels in a clear top-to-bottom sequence. If the user supplies a template, reproduce that geometry instead. Never reduce a panel until bilingual text becomes cramped.

Reserve these zones before generating art:

- title and lesson number outside the comic action area
- one or two empty rounded balloons per panel
- clear tail paths that identify speakers without crossing faces or equipment
- a quiet background area behind each balloon
- unobstructed faces, hands, tubing, monitoring displays, call buttons, mobility aids, and medication-related objects

## Illustration-integrated balloon placement

Treat dialogue placement as part of the composition, not as a repair performed after the characters are drawn.

1. Mark protected regions first: faces, eyes, mouths, head and hair outlines, hands, action-relevant limbs, patient identifiers, tubes, medication labels, monitors, and clinically meaningful equipment. Add visible clearance around them.
2. Mark one or two quiet dialogue regions inside each panel. Prefer walls, ceilings, curtains, floors, windows, or deliberately simplified background. A balloon may sit beside a face, but its outline, tail, and text must not cross the facial or hair contour.
3. Stage characters to preserve those regions. Shift the camera, gaze direction, or character grouping before reducing font size or moving every balloon outside the illustration.
4. Keep the tail short and unambiguous. Aim it toward the speaker's torso or shoulder direction without crossing a face, hand, or clinical action.
5. Use a rounded circle or oval with comfortable padding. Keep one utterance to two or three short lines whenever the format permits.
6. Direct narration without a balloon is allowed only in a deliberately quiet field with strong contrast; spoken dialogue remains in a rounded balloon.

Do not reproduce a supplied reference page's characters, drawing style, dialogue, or panel arrangement. Extract only functional principles such as reserved negative space, protected-face clearance, reading order, and speaker identification.

## Textless-art prompt template

Replace bracketed fields and send the prompt to the image-generation tool:

    Create a portrait four-panel manga page for an adult nursing education book.
    Setting: [generic hospital area, time, atmosphere].
    Adult characters: [roles, approximate adult age, appearance, clothing without logos].
    Panel 1: [setup and camera angle].
    Panel 2: [friction and camera angle].
    Panel 3: [clarification and camera angle].
    Panel 4: [warm or lightly humorous resolution and camera angle].
    Reserve one or two quiet negative-space zones for rounded speech balloons.
    Empty balloons may be included, or the zones may be left clean for deterministic composition.
    Keep every zone fully inside its panel and visibly clear of all faces, eyes,
    mouths, head and hair outlines, hands, action-relevant limbs, patient identifiers,
    medication labels, tubes, monitors, and clinically meaningful equipment.
    Stage the adult characters around the dialogue zones. Show complete heads and limbs.
    No words, letters, numbers, symbols, logos, signage, watermarks, or captions.
    Warm professional manga style, adult proportions, clear expressions,
    consistent high-detail rendering, clean negative space for later typesetting.

Use negative instructions again during any repair edit. If the generator inserts pseudo-text, remove or regenerate it before typesetting.

## Dialogue composition

For each balloon, place:

1. canonical English in the larger, bolder style
2. canonical Japanese immediately below in a slightly smaller style

Keep a stable hierarchy throughout the book. Do not shrink only later lessons. Prefer shortening dialogue, widening the balloon within its safe zone, or splitting an utterance across panels.

Apply these fit rules:

- maximum two short utterances in one panel
- one idea per English sentence
- no orphaned one-character Japanese line
- no line ending that changes a number, unit, negative, or timing phrase
- comfortable inner padding on all sides
- balloon tail points to the speaker without touching the face
- balloon and text occupy a planned quiet region inside the illustration when possible
- English and Japanese remain readable at iPad 100% view

## Composition order

1. Lock page and panel geometry.
2. Place textless art.
3. Draw or refine empty balloons on a separate layer.
4. Insert canonical English and Japanese from balloon IDs.
5. Run spelling, line-break, and collision checks.
6. Overlay the protected-region mask and reject any balloon, tail, or text intersection before exporting a proof image.
7. Inspect the proof at 100%, including the distance from every balloon to each face and action-relevant hand.
8. Preserve editable source; flatten only the publication copy.

## Repair rule

Edit the smallest defective region when style and anatomy are otherwise correct. Regenerate a full page when any face, hand, clinical action, panel order, or multiple balloon zones are wrong. After repair, rerun all page-level checks; a fixed overlap can create a new tail, crop, or text-size defect.
