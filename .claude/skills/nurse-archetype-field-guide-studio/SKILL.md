---
name: nurse-archetype-field-guide-studio
description: Create humorous, image-rich field guides of recurring nursing-workplace behavior archetypes, usually as 25 illustrated types with ecology, catchphrases, and practical responses. Use for senior-nurse, junior-nurse, preceptor, or ward-culture taxonomy books and PDFs; do not use to diagnose or target real individuals.
---

# Nurse Archetype Field Guide Studio

Turn difficult nursing-workplace behavior into a funny but useful field guide. Make the behavior recognizable without making a person's age, body, disability, ethnicity, or appearance the joke.

## Choose the viewpoint

Identify who is being observed and who needs the response:

- difficult senior behavior -> junior nurse's protective response;
- difficult junior behavior -> senior nurse's coaching response;
- preceptor or ward-culture behavior -> the appropriate safe response.

Default to 25 types when the user asks for a substantial collection without giving a count. Preserve any explicit count.

For the approved 25-type difficult-senior edition, read [references/senior-archetypes.md](references/senior-archetypes.md). Treat it as a reusable seed catalog, not immutable wording.

## Build the catalog first

Create one manifest record per type before generating art:

- `id` and a short comic type name;
- a one-line hook;
- `ecology`: repeatable behavior in two or three sentences;
- two plausible catchphrases, written as composites rather than quotations from a real colleague;
- a concrete response that includes words the reader can actually say;
- one short `field tool`, such as facts, closed-loop confirmation, standard procedure, documentation, or escalation;
- a distinct visual cue based on expression, posture, movement, or props.

Make type names memorable and lightly absurd, such as a quiz champion, moving goalpost, boomerang, freezer, or field-guide creature. Keep the underlying behavior psychologically credible.

## Write responses that protect learning and safety

Responses should return the interaction to observable facts, roles, priorities, and patient safety. Favor short scripts that can be spoken under stress.

- Separate another person's mood from the task.
- Clarify priority, decision owner, report trigger, and time limit.
- Use SBAR, read-back, or closed-loop confirmation when clinically relevant.
- Record repeated conduct as date, place, exact words, action, and patient impact rather than an interpretation of character.
- Escalate recurring humiliation, discrimination, retaliation, unsafe shortcuts, or blocked urgent reporting through the appropriate leader or consultation route.
- In an emergency, stabilize the patient and summon help before discussing blame.

Do not diagnose a real person with a psychiatric, neurodevelopmental, or personality disorder. Distinguish an awkward interaction from repeated bullying and from a patient-safety violation.

## Visual contract

When the user requests actual illustrations, use one original raster illustration per type. Unless the user changes the edition brief, use the YAKUBON visual defaults:

- fictional adult women nurses in generic, logo-free scrubs;
- polished manga-inspired editorial illustration with clean ink and soft watercolor-like shading;
- navy, sky blue, warm coral, yellow, and green accents;
- transparent or plain uncluttered background;
- three-quarter or full-body framing with the complete head, face, hands, feet, and defining prop visible;
- strong characterization through eyebrows, gaze, stance, movement, and props, never through ridicule of anatomy or protected traits;
- no generated words, badges with text, logos, watermarks, or speech balloons.

Keep the art text-free and add all Japanese copy during layout. This prevents image-model spelling errors and makes face-safe composition deterministic.

For batches, create one prompt and one generated asset per distinct type. Reuse a shared visual bible but vary the visual cue, pose, and prop so the 25 images do not look duplicated.

## Page contract

For a fixed-layout iPad or Kindle review edition, default to a 1009 x 1536 px portrait canvas or its 504.5 x 768 pt PDF equivalent:

- top: navy type-number and title band, followed by a short yellow marker line;
- left 40%: one large characterized illustration in a pale blue specimen panel;
- right 60%: orange `生態`, yellow `よく言う言葉`, green `対応`, then a navy `効く道具` chip;
- generous white space and no page number unless requested;
- no text, label, number, box, or decoration may overlap a face or essential prop.

A complete 25-type review book may use 28 pages: cover, how-to-read page, 25 type pages, and one common-equipment page.

Use the image-generation skill for requested art, the PDF skill for a requested review PDF, and the Kindle visual-book skill only when the user requests KDP assembly or publishing handoff. Respect each skill's authorization boundary.

## Quality gate

Before delivery, verify:

- the manifest contains the requested number of unique IDs, names, behaviors, catchphrases, responses, and visual cues;
- every type appears exactly once and has the correct illustration;
- no generated text, real logo, duplicated character, malformed hand, cropped head, or missing defining prop appears;
- no text overflows its box or intersects a face;
- every clinically risky pattern has an explicit safety-first action and escalation route;
- the final PDF has the intended page count and canvas size;
- all pages pass a full-book contact-sheet review and representative 100% inspection, with every long title and long quotation checked at full size.

Present the result as behavior literacy, not a blacklist of people. The joke should give the reader distance; the response should give the reader agency.
