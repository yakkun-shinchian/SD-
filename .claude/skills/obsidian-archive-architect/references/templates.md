# Obsidian archive templates

## Raw conversation note

```yaml
---
title: "Original conversation title"
created: 2026-01-01T12:34:56+09:00
updated: 2026-01-01T13:10:00+09:00
source: chatgpt
source_id: "stable-source-id"
archive_status: raw
topics: []
aliases: []
---
```

Body:

```markdown
# Original conversation title

## User

Original user text.

## Assistant

Original assistant text.
```

Repeat speaker headings in chronological order. Do not silently repair or summarize the raw text.

## Selected summary note

```yaml
---
title: "Concise summary title"
created: 2026-01-01
source_notes:
  - "[[Raw note title]]"
topics:
  - nursing
status: reviewed
---
```

Use sections: decision, key facts, unresolved questions, next actions, and source links.

## Topic index

```markdown
# Topic: ECG

## Core notes

- [[Selected summary]] — one-line value statement

## Raw conversations

- [[Raw conversation]] — date and short context

## Open questions

- [ ] Question to investigate
```

## Official references

- Obsidian import overview: https://obsidian.md/help/import
- Official Importer plugin: https://obsidian.md/help/plugins/importer
- Apple Notes import: https://obsidian.md/help/import/apple-notes
- Properties: https://obsidian.md/help/properties
- Templates: https://obsidian.md/help/plugins/templates

