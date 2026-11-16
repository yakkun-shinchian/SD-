---
name: explain-drug-infographic
description: Verify a medicine from its brand or generic name, then create a current, source-linked Japanese explanation and a finished infographic covering mechanism of action, indications, distinguishing features, generic availability, common and serious adverse effects, precautions, and urgent warning signs. Use when a user enters only the name of a prescription drug, OTC drug, injection, biologic, or combination product, or asks about its action, effects, side effects, characteristics, generic version, patient education, nursing points, an infographic, or a visual explanation. Default to medicines marketed in Japan unless the user specifies another country.
---

# Explain Drug Infographic

Turn a medication name into an evidence-checked explanation and a readable Japanese infographic. Keep the text answer available alongside the image so safety information remains searchable and accessible.

## Workflow

### 1. Identify the medicine

- Normalize likely spelling or voice-input errors, but confirm the identity against a current official source before explaining it.
- State the trade name, generic name, active ingredient, dosage form, route, and drug class when known.
- For a combination product, list every active ingredient.
- If two or more medicines are plausible, or the formulation changes the safety profile, ask one short clarifying question. Do not guess and do not generate the infographic until resolved.
- Assume the Japanese market and Japanese naming unless the user specifies another country.

### 2. Research it fresh

Browse current sources for every request because labels, warnings, and generic availability can change.

For Japan, prioritize:

1. PMDA electronic labeling/package inserts and safety communications
2. The current interview form and official patient medication guide
3. MHLW drug-price-list or other official listings for generic availability
4. Current professional guidelines or peer-reviewed reviews for clinical context

For another country, use its medicines regulator and official product label first. Use manufacturer pages only as supplementary sources. Do not use search snippets, commercial drug summaries, or memory as the sole support for a medication claim.

Cross-check the active ingredient, boxed or major warnings, serious adverse reactions, and generic status. Cite sources beside the relevant text and record the verification date. If authoritative sources conflict, show the discrepancy and leave the disputed point out of the infographic.

### 3. Build the explanation

Lead with one plain sentence answering: “What does this medicine do?” Then use these sections:

1. **Basic identity** — trade name, generic name, class, main approved uses, route/formulation, and generic availability as of the verification date.
2. **How it works** — explain the sequence `target → physiological change → clinical effect` in three short steps. Add one clearly labeled analogy when helpful; do not let the analogy replace the mechanism.
3. **Characteristics** — give three to five clinically useful distinguishing points such as onset/duration, administration constraints, elimination, monitoring, or a relevant advantage/limitation. Include only verified, drug-specific points.
4. **Adverse effects** — separate:
   - relatively common or expected effects;
   - important serious effects;
   - observable warning signs and what level of help to seek.
5. **Major cautions** — summarize the most relevant contraindications, interactions, organ-function considerations, and monitoring. Adapt detail to the user’s question.
6. **Practical takeaway** — end with two or three actions or observations useful to a patient, caregiver, or nurse.

Use official frequency wording or numerical incidence only when the source provides it. Label “frequency unknown” explicitly. Do not turn every item in the package insert into an undifferentiated list.

### 4. Explain “generic” precisely

Always distinguish:

- **Generic name / active ingredient name** from
- **Generic product availability in the relevant market**.

Say “generic available,” “no approved/listed generic found,” or “could not confirm,” with the date and source. Never infer nonexistence from a failed search or promise local pharmacy stock. Explain briefly that generic products use the same active ingredient and must meet applicable quality/bioequivalence requirements, while excipients, device design, taste, shape, or formulation can differ. Treat biosimilars separately from ordinary small-molecule generics.

### 5. Apply safety boundaries

- Do not diagnose, prescribe, recommend dose changes, or advise abrupt discontinuation from a general drug explanation.
- If the user describes a patient, separate general label facts from patient-specific risk and recommend confirmation with the prescriber or pharmacist where appropriate.
- Put emergency warning signs before routine advice when symptoms suggest anaphylaxis, severe skin reaction, major bleeding, loss of consciousness, dangerous arrhythmia, overdose, or another time-critical reaction.
- Give symptom-based escalation rather than a vague “seek care” instruction. Recommend emergency services for breathing difficulty, swelling of the face/tongue/throat, collapse, seizure, profound impaired consciousness, uncontrolled major bleeding, or another immediately life-threatening presentation. Recommend prompt same-day contact with the prescriber or an urgent service for a newly suspected serious reaction that is stable but cannot safely wait for a routine visit. Avoid inventing a triage threshold that the label or available clinical context does not support.
- Keep indications and dosing tied to the verified formulation, route, age group, and country. Do not transfer instructions between formulations.
- State uncertainty plainly rather than filling gaps with a plausible-sounding answer.

### 6. Create the infographic

Create the finished infographic after locking the verified facts. Do not stop at an image prompt or layout description unless image creation is unavailable.

Use a vertical, mobile-readable design, preferably 4:5, with:

- title: trade name plus generic name;
- a one-line purpose statement;
- a three-step mechanism flow;
- key characteristics;
- common adverse effects;
- serious adverse effects and urgent warning signs;
- generic status;
- a compact source footer with verification date.

Use high-contrast Japanese typography, large labels, generous spacing, and a restrained blue/teal palette. Reserve red for urgent danger and amber for caution. Prefer simple medical icons and clean anatomy or mechanism diagrams over decoration. Keep the image concise; retain nuance and citations in the accompanying text.

Use the native image-generation tool when it can preserve the exact Japanese wording. If it produces garbled text or factual drift, create a deterministic SVG, HTML, document, or slide-based infographic instead and render a preview. Never accept a visually attractive image that changes the drug name, mechanism, warning, or generic status.

Inspect the result before delivery. Verify that:

- the medicine and ingredient names are correct;
- all Japanese text is legible and unclipped;
- no unsupported facts or dosing instructions were introduced;
- common and serious adverse effects remain clearly separated;
- the source footer and verification date are visible.

Treat the image as failed if any title, active ingredient, generic-status statement, or urgent-warning phrase differs from the locked text; if any character is garbled; or if any text crosses a panel or canvas boundary. Correct or regenerate the image when any check fails.

## Output order

1. One-sentence summary
2. Structured evidence-checked explanation
3. Urgent safety note, only when relevant
4. Finished infographic
5. Brief source list with direct links

Use calm, patient-friendly Japanese by default. When the user is a healthcare professional or requests clinical depth, add concise pharmacological and nursing detail without making the infographic crowded.
