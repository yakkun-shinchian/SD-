---
name: prompt-skill-1
description: "プロンプトスキル1。Create consistently detailed, self-contained English prompts for external image/video AIs such as Seedance, Gemini/Veo, Kling, and Firefly. Use when the user asks for 外部AIに渡す英語プロンプト, 完璧な指示文, NOT/DO NOT restrictions, or medical CGI image-to-video prompts. Preserve the user's preferred comprehensive level rather than arbitrarily shortening successive requests."
---

# プロンプトスキル1

## Output contract

- Give a short Japanese introduction identifying the exact image numbers, order, target AI, duration, and aspect ratio; then provide one complete, copy-ready English code block.
- Treat the receiving AI as having NO access to this conversation. Restate every necessary instruction in each prompt. Never say only “same as before,” “use previous settings,” or rely on omitted negatives.
- Default to the comprehensive level of the approved 031–035 flow-diverter example: approximately 1,200–1,800 English words for a comparable multi-reference medical animation. Keep all nine sections below and detailed NO / NOT / DO NOT instructions. This is a density guide, not a padding quota. Do not silently reduce to a short prompt on later turns.
- Shorten only if the user requests it or a verified target input limit requires it. For a limit, explain briefly and give a complete optimized version; preserve critical constraints rather than silently truncating.
- Never promise perfection, zero errors, native 4K, or guaranteed reference adherence. Length alone does not ensure accuracy: eliminate contradictions and ambiguous instructions.
- Use the full structure for other subjects too, adapting anatomy/device sections to subject geometry/objects. Do not add irrelevant medical restrictions to unrelated work.

## Workflow

1. Resolve the requested scene and numbered image range from the current task. Respect corrected/replacement images. Never mix adjacent scenes or use a known rejected version.
2. Inspect supplied images when available. Distinguish observed details from the written storyboard. If images are unavailable, write from the supplied storyboard without claiming visual inspection; ask only if a missing reference is essential.
3. Identify the scene's starting state, ending state, permitted moving objects, invariant objects, and physical causal sequence.
4. Set reference hierarchy. Use the best accepted image as geometry anchor, not automatically the lowest number if it is known defective. Treat subsequent references as motion/state guides. Do not ask a model to preserve a known anatomical error; explain when corrected inputs are needed.
5. Read `references/requirements.md` and adapt its safeguards to the scene. Use prior failure reports to add specific restrictions, not generic repetition.
6. If adding uncertain medical claims, verify with authoritative primary sources. A prompt-only transformation of supplied content does not require inventing new claims. Keep sources/explanation outside the copy block.
7. Do not assume a target supports five keyframes, separate negative prompts, a given duration, or 4K. Verify current capabilities if making a platform-specific claim; otherwise phrase capabilities conditionally. Preserve the requested target name without inventing API settings.
8. Draft the complete English prompt using the fixed structure. Audit it before delivery.

## Fixed structure — include every section

Start with PROJECT, SHOT, REFERENCE IMAGES IN EXACT ORDER, DURATION, FORMAT, STYLE; state the intended visual message and scope.

1. **REFERENCE HIERARCHY AND CONTINUITY**: anchor image; role of each subsequent image; correction priority; what must not morph; continuity versus intentional transitions.
2. **CAMERA AND COMPOSITION**: framing, view, focal length, locked or explicitly requested motion. State prohibited camera operations individually. Do not forbid a zoom when the user requested a zoom.
3. **ANATOMY / SUBJECT GEOMETRY**: locations, shapes, boundaries, branches, scale, material visibility; specific impossible deformations to prohibit.
4. **DEVICE / OBJECT STATE AND MECHANICS**: exact initial and final states, material, topology, endpoints, allowed movement and dependencies. A deployment scene needs deployment; an already implanted scene does not.
5. **PARTICLES, FLOW, AND MOTION**: direction relative to visible anatomy, speeds, trajectories, continuity, collision behavior, entry/exit, permitted residual motion. Never infer flow direction from color alone.
6. **TIMED MOTION PLAN**: contiguous intervals covering the entire duration, no gaps/overlap. For five references over six seconds, default to five 1.2-second intervals. Describe visible action, unchanged geometry, and final hold with appropriate ongoing motion.
7. **TIME SCALE AND DOMAIN MEANING**: immediate versus delayed changes; symbolic representation; prohibit incorrect causal implications. Specify how time passage is communicated when delayed healing is shown; do not accidentally forbid it in those scenes.
8. **MATERIALS, LIGHTING, AND QUALITY**: subject-specific style, transparency, contrast, mesh/detail stability; prohibit flicker, excess bloom, shape changes, texture crawling, and unwanted additions.
9. **OUTPUT AND PRIORITIES**: duration, ratio, resolution conditional on support, audio/text policy, no unexpected overlays; ranked correctness priorities and instruction to omit an effect if it would violate them.

## Negative-instruction standard

- Pair an affirmative behavior with concrete NO / NOT / DO NOT restrictions for each major failure mode.
- Cover camera drift, geometry distortion, object duplication/disappearance, topology changes, physical boundary violations, particle teleportation, unwanted effects, incorrect timeline, and output contamination.
- Use scene-specific negatives. Do not reuse “no catheter” for a catheter insertion scene or “no thrombus” for a delayed thrombosis scene.
- Avoid contradictory blanket constraints such as “all objects stationary” while blood must move, or “no transitions” while comparing before/after.
- If the target has a verified separate negative field, optionally provide a separate copy block for it while keeping the main prompt self-contained. Otherwise keep negatives in the main block.

## Final audit

Check reference order and corrected variants; anchor integrity; medical/physical consistency; camera requirements; moving versus fixed entities; continuous timeline totaling requested seconds; no missing nine sections; specific negatives; no contradictory stage instructions; no unverified tool promises; readable copy block without placeholders.

For revisions, return the entire revised prompt, not a patch list. Keep the same depth and section order unless the user changes the specification.

