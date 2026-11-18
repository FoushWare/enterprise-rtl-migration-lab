---
name: session-handoff
description: Prepare a concise, evidence-based handoff prompt when an independent task should move to a fresh Codex session. Use after Session Guard classifies a request as NEW_SESSION, or when the user explicitly asks for a session handoff.
---

# Session Handoff

Prepare a handoff only; never implement the independent task that triggered it.

1. Re-read the applicable `AGENTS.md` and the relevant entry in `docs/project-memory/README.md`. Follow only task-relevant memory links; do not repeat broad repository discovery.
2. Collect only verified, task-relevant state. Recheck sources before stating current status. If a fact is not verified, label it as an open question or omit it.
3. Summarize the task boundary, completed work, relevant file paths, outstanding issues, constraints, and next steps. Reference existing Project Memory instead of copying its architecture or production details.
4. Preserve historical decisions, approval states, and draft/review status exactly. Never infer approval from a successful build, test, render, or QA result.
5. Exclude secrets, credentials, unrelated conversation history, speculative claims, and unsupported estimates of context or token usage.
6. Return a concise, standalone prompt the user can copy into a fresh Codex session. State clearly that the user approved execution of the described task in that new session. That approval makes the task `CONTINUE` there; do not create another handoff merely because the session is fresh.
7. Do not create branches, commits, messages, or external artifacts unless separately requested. Stop after presenting the handoff prompt and wait for the user to start or authorize the new session.

## Handoff prompt structure

Include:

- **Approved task:** clear scope and an explicit statement that execution is approved in this fresh session.
- **Verified progress:** completed work and evidence, with uncertainty identified.
- **Relevant files:** only paths needed to continue.
- **Constraints:** safety, scope, and approval boundaries that still apply.
- **Next steps:** the smallest concrete sequence needed to complete the task.
- **Memory:** point to `AGENTS.md` and `docs/project-memory/README.md`; do not duplicate their contents.
