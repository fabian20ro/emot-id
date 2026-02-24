# Emot-ID

> Non-discoverable bootstrap context.
> If the model can find it in the codebase, it does not belong here.
> For corrections and patterns, see LESSONS_LEARNED.md.

Privacy-first, clinically respectful emotion identification tool. No backend, no telemetry.

## Operating Priorities

1. Safety and correctness
2. Accessibility and UX quality
3. Extensibility and maintainability
4. Performance and bundle discipline
5. Delivery speed

## Constraints

- Client-only. No backend, no telemetry, no outbound network calls without explicit product/security intent.
- i18n is mandatory for all user-facing copy (`src/i18n/en.json` + `ro.json`).
- Fixed overlays must portal to `document.body` and focus-trap (WebKit stacking context bug).
- Crisis logic (`src/models/distress.ts`, `src/data/temporal-crisis.ts`) must remain deterministic and auditable.

## Safety Guardrails

- Do not weaken crisis-tier detection or escalation semantics without explicit tests.
- Graduated access: tier1-3 crisis contextualizes (shows resources) but does not gatekeep (hide tools). Only tier4 pre-acknowledgment gates features. Do not reintroduce binary suppression.
- Do not introduce data loss paths when toggling session persistence.
- Do not add outbound network behavior without explicit product/security intent.
- Keep disclaimer and crisis support surfaces reachable and comprehensible.

## Data Integrity Notes

- Plutchik dyad `nostalgia` uses `[serenity, sadness]` (distinct from bittersweetness).
- Plutchik `compassion` uses `[trust, sadness]` to preserve reachability.
- Plutchik duplicate `aggressiveness` was removed in favor of `ruthlessness`.
- Wheel replaced non-emotion label `busy` with `overwhelmed`.
- Dimensional model includes extra unpleasant-calm emotions to reduce quadrant sparsity.

## Workflow

- Before editing: read relevant docs in `docs/CODEMAPS/`, read `LESSONS_LEARNED.md`. If prioritizing, read `ANALYSIS.md` first.
- After structural changes: update codemaps in the same PR.

## Learning System

This project uses a persistent learning system. Follow this every session:

1. **Start of task:** Read `LESSONS_LEARNED.md` — validated corrections and patterns
2. **During work:** Note any surprises or non-obvious discoveries
3. **End of iteration:** Append to `ITERATION_LOG.md` (always). Update `LESSONS_LEARNED.md` (if reusable insight)
4. **Pattern detection:** Same issue 2+ times in the log → promote to `LESSONS_LEARNED.md`

| File | Purpose | When to Write |
|------|---------|---------------|
| `LESSONS_LEARNED.md` | Curated, validated wisdom | When insight is reusable |
| `ITERATION_LOG.md` | Raw session journal (append-only) | Every iteration (always) |

Rules: Never delete from `ITERATION_LOG.md`. Obsolete lessons → Archive section in `LESSONS_LEARNED.md` (not deleted). Date-stamp everything `YYYY-MM-DD`. When in doubt: log it.

## Sub-Agents

Specialized agents in `.claude/agents/`. Invoke proactively — don't wait to be asked.

| Agent | When to Use |
|-------|-------------|
| psychologist | Adding/modifying emotion models, writing descriptions, crisis logic review |
| senior-software-engineer | Planning features, reviewing architecture, structural decisions |
| code-simplifier | Post-implementation refinement, refactoring |
| ux-expert | Layout changes, interaction design, accessibility, responsive behavior |
| planner | Complex multi-step features, cross-cutting changes |
| agent-creator | Creating new specialist sub-agents |
