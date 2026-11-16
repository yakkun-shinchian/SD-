# Medical-English explanation template

Use short Japanese explanations and a calm visual hierarchy. Prefer one portrait page only when the measured content remains comfortably readable; otherwise continue on numbered LANGUAGE NOTES pages.

## Mandatory flow layout

Treat section positions as outputs, never constants. Measure the heading and every wrapped body line before placing a section. Maintain a `current_y` cursor: heading, heading gap, body at its measured height, then a section gap. Start the next section below that final position.

- English wraps at word boundaries; Japanese wraps character-by-character with basic kinsoku handling.
- Keep body text at 14–18 pt equivalent and section headings at 18–22 pt equivalent.
- Use body line height of 1.25–1.45 times the font size and a section gap of at least 0.6 times the body size.
- Maintain a bottom safe margin. When the next complete section does not fit, continue on a new `LANGUAGE NOTES n/N` page.
- Record text bounding boxes and fail when unintended text intersections, clipping, out-of-bounds text, missing text, heading/body collisions, body/body collisions, or bottom overflow are nonzero.
- Never reduce text below the minimum size merely to retain one page.

## Lesson [number] — [Japanese title] / [English title]

### 1. 今日の会話目標

[読者がこのレッスン後に実際に言える・聞けることを一文で書く]

### 2. 今日の必修フレーズ

Resolve two or three balloon references from the canonical data.

- [English from balloon ID] — [Japanese from the same balloon ID]
- [English] — [Japanese]
- [English] — [Japanese, optional]

### 3. 重要単語・イディオム

Use three to five concise entries. Include only fields that help the learner.

| Term | Plain meaning | Clinical use and nuance | Short example |
| --- | --- | --- | --- |
| draw, verb | 描く・引く | draw blood では採血する | I need to draw some blood. |

### 4. 文法・会話パターン

**Pattern:** [Could you + verb ...?]

[中学英語とのつながり、丁寧さ、病棟での使い方を簡潔に説明]

**Comic example:** resolve [balloon ID]

### 5. 中学英語が病棟ではこう使われる

[基本語一つを取り上げ、一般的な意味から医療場面の意味へ橋をかける]

### 6. 入れ替えて使える応用例

- [Natural English] — [Natural Japanese]
- [Natural English] — [Natural Japanese]

Change one meaningful element at a time so the reusable frame remains visible.

### 7. 不自然な直訳・よくある間違い

- Avoid: [wrong or awkward expression]
- Prefer: [natural expression]
- Why: [short Japanese explanation]

Do not invent a mistake merely to fill the section. Choose a plausible Japanese-speaker error.

### 8. 患者安全・通訳利用

Include this block only when a misunderstanding could affect care. State the limit, the safe action, and one handoff phrase. Do not turn it into a legal lecture.

### 9. ミニ練習

**Question:** [one substitution, response, or comprehension prompt]

Store the model answer in canonical data and place it in the end answer key unless there is ample space.

## Writing limits

- Favor patient-facing words: blood pressure rather than BP, blood thinner with an optional anticoagulant note, and breathing trouble rather than a diagnostic label.
- Keep required phrases exactly equal to the comic text by resolving balloon references.
- Explain one grammar point, not every grammar fact in the sentence.
- Distinguish a general-English meaning from a clinical meaning when it creates a memorable learning bridge.
- Note American-British differences only when they could change comprehension, such as restroom/toilet, shot/injection, or discharge usage.
- Use non-shaming Teach-Back language. Frame misunderstanding as the speaker's need to explain more clearly.
- Avoid Japanese translations that sound natural but add clinical facts absent from the English.
