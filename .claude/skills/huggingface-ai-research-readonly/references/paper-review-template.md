# AI paper review template

## Identity

- Title, authors, date, version, venue/status
- arXiv ID or DOI
- Hugging Face paper page
- Official repository, model, dataset, and project page

## Claim map

| Layer | Question |
|---|---|
| Problem | What specific limitation is addressed? |
| Intervention | What changed compared with the strongest baseline? |
| Evidence | Which result directly supports the claim? |
| Cost | What data, compute, latency, memory, or human effort is required? |
| Boundary | Where does the result not generalize? |

## Reliability checks

- Same benchmark version, prompt budget, tool access, sampling, and scoring?
- Test contamination or training overlap assessed?
- Confidence intervals, repeated runs, or significance reported where relevant?
- Ablations isolate the claimed contribution?
- Open weights/code/data sufficient to reproduce the central result?
- Evaluation performed by authors only, or independently replicated?
- Safety and misuse evaluated in the actual deployment setting?

## Public read-only endpoints

- Paper Markdown: `https://huggingface.co/papers/{ARXIV_ID}.md`
- Paper metadata: `https://huggingface.co/api/papers/{ARXIV_ID}`
- arXiv abstract: `https://arxiv.org/abs/{ARXIV_ID}`
- arXiv PDF: `https://arxiv.org/pdf/{ARXIV_ID}`

Source documentation: https://huggingface.co/docs/hub/agents-skills
Official skill repository: https://github.com/huggingface/skills

