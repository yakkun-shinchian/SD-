# Static review checklist

## Instruction-layer risks

- Attempts to override system or user instructions, conceal behavior, suppress disclosure, or widen scope.
- Requests to trust repository text as instructions rather than data.
- Instructions to collect secrets, private files, identifiers, or conversation content.
- Invisible Unicode, bidirectional controls, zero-width characters, misleading filenames, or long encoded text.
- Tool calls or destructive actions presented as mandatory without user authorization.

## Code and execution risks

- `eval`, dynamic imports, decoded execution, unsafe deserialization, shell interpolation, `subprocess`, `child_process`, PowerShell, AppleScript, macros, or downloaded binaries.
- Install hooks, login/startup persistence, cron, scheduled tasks, system services, browser extensions, or shell profile edits.
- Recursive deletion, overwrite, chmod/chown, privilege escalation, or writes outside the declared project.
- Network egress, arbitrary URLs, webhooks, sockets, telemetry, or uploads unrelated to the stated purpose.
- Reads of `.env`, SSH keys, cloud credentials, keychains, cookies, tokens, shell history, or broad home directories.

## Supply-chain risks

- New or look-alike maintainer, missing license, unsigned or mutable release, floating branch, or unpinned dependency.
- Package-name typosquatting, dependency confusion, install-time compilation, or fetched code not included in review.
- Bundled binary or large asset whose origin and digest cannot be established.
- Scanner or installer that extracts archives unsafely, follows symlinks, or fetches remote content during inspection.

## Evidence and verdict rules

- Review files offline whenever possible and never run the candidate to learn what it does.
- Trace suspicious behavior from entry point to sensitive operation and record counterevidence.
- Downgrade harmless examples and localhost-only snippets when they cannot execute automatically.
- Reject confirmed prompt injection, credential harvesting, unauthorized exfiltration, persistence, destructive behavior, or deceptive scope expansion.
- Prefer a reduced, instruction-only rewrite when useful knowledge can be retained without risky code.

Useful public references:

- Agent Skills format: https://agentskills.io/specification
- Hugging Face context course: https://huggingface.co/learn/context-course/unit1/introduction
- NVIDIA SkillSpector source: https://github.com/NVIDIA/SkillSpector
- Example of why scanners also require review: https://github.com/NVIDIA/SkillSpector/issues/147

