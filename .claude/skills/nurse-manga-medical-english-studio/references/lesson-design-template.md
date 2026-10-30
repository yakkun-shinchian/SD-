# Lesson design template

Use this form to create the canonical lesson pack. Keep every phrase in one place and refer to balloon IDs elsewhere.

## Contents

1. Project brief
2. Lesson matrix row
3. One-lesson form
4. Canonical-data rules

## 1. Project brief

| Field | Value |
| --- | --- |
| Japanese title | |
| English title | |
| Volume | |
| Specialty | General ward unless changed |
| Audience | Japanese nurses and nursing students |
| CEFR | A2-B1 |
| English variety | American English |
| Conversation partner | Adult patient |
| Lesson count | 50 |
| Prototype count | 10 |
| Author | YAKUBON STUDIO |
| Series | KAWAII JAPAN COLLECTION |
| Page ratio | 1009:1536 unless changed |
| Reading direction | Left to right unless changed |
| Human clinical reviewer | Name/status |
| Human English reviewer | Name/status |
| Medical/language sources checked | Date and official sources |
| Current KDP guidance checked | Date and official pages |

## 2. Lesson matrix row

Complete one row per lesson before drafting dialogue.

| Field | Rule |
| --- | --- |
| lesson_no | Continuous integer beginning at 1 |
| part | 1-5 |
| title_ja / title_en | Unique and concrete |
| scene_key | Unique noun phrase such as morning-vital-signs |
| learning_goal | One observable communication outcome |
| patient_task | What the patient needs to understand or answer |
| grammar_pattern | Reusable pattern; deliberate repetition is allowed |
| character_signature | Unique adult character combination, roles, and staging |
| expression_signature | Unique sequence of expressions across the four panels |
| composition_signature | Unique camera-angle and framing sequence |
| visual_signature | Unique setting + action + camera angle + emotional beat |
| safety_tier | routine, caution, or high |
| review_status | planned, drafted, reviewed, approved |

## 3. One-lesson form

### Identity

- Lesson number:
- Part:
- Japanese title:
- English title:
- Scene key:
- Setting and time:
- Characters and roles:
- Learning goal:
- Patient task:
- Intended emotional beat:
- Character signature:
- Expression signature:
- Composition signature:
- Visual signature:

### Four-panel beat sheet

| Panel | Visual action | Speaker | Canonical English | Faithful Japanese | Balloon ID |
| --- | --- | --- | --- | --- | --- |
| 1 Setup | | | | | P1-B1 |
| 2 Friction | | | | | P2-B1 |
| 3 Clarification | | | | | P3-B1 |
| 4 Resolution | | | | | P4-B1 |

Add a second balloon only when essential. Keep the sequence clinically coherent. Do not invent a completed assessment or intervention that is not shown.

### Explanation design

- Goal in one sentence:
- Required phrase references, two or three balloon IDs:
- Vocabulary, three to five entries:
- Grammar pattern:
- Junior-high-English bridge:
- Two substitutions:
- One common error and correction:
- Safety note, only when needed:
- Mini-practice question:
- Model answer for the end answer key:

For each vocabulary item, include only useful fields: part of speech, basic meaning, clinical meaning, natural Japanese, short example, politeness or nuance, and difference from general English.

### Safety decision

- Tier: routine / caution / high
- Can the nurse act within an ordinary role and local policy?:
- Escalation required?:
- Interpreter plan: not_needed / consider / qualified_required
- Safe handoff phrase in English and Japanese:
- Potential harm if misunderstood:
- Local-policy item requiring confirmation:

### QA status

- Dialogue and explanation use the same balloon references:
- English-Japanese meaning reviewed:
- Clinical sequence reviewed:
- Image contains no generated text:
- Balloon and text collision review:
- iPad 100% readability review:
- Clinical human review:
- English human review:
- Final disposition and date:

Do not use `approved` without a reviewer identity and review date. Keep automated validation, clinical review, English review, and iPad visual review as separate decisions.

## 4. Canonical-data rules

1. Store dialogue only under comic.panels[].dialogue in the lesson JSON.
2. Give each utterance a unique balloon_id.
3. Store required_phrase_refs and grammar example_ref as balloon IDs, never copied text.
4. Render both comic and explanation from the resolved referenced text.
5. If a phrase changes, update the dialogue once and regenerate both pages.
6. Keep intentional pattern repetition visible in the curriculum matrix; do not misclassify it as accidental duplication.
7. Keep character, expression, composition, and visual signatures concrete enough to compare across all lessons.
8. Hash final page files after approval and package those exact files.

