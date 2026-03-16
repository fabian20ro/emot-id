# AGENTS.md

work style: telegraph; noun-phrases ok; drop grammar; min tokens.

> bootstrap context only. discoverable from codebase → don't put here.
> corrections + patterns → LESSONS_LEARNED.md.

## Constraints

- Client-only. No backend, no telemetry, no outbound network calls without explicit product/security intent.
- i18n mandatory for all user-facing copy (`src/i18n/en.json` + `ro.json`).
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

## Legacy & Deprecated

<!-- codebase parts that actively mislead. add only if removal isn't possible. -->

## Learning System

Every session:
1. start: read `LESSONS_LEARNED.md`
2. during: note surprises
3. end: append `ITERATION_LOG.md`
4. reusable insight? → also add `LESSONS_LEARNED.md`
5. same issue 2+ times in log? → promote to `LESSONS_LEARNED.md`
6. surprise? → flag to developer (they decide: fix codebase / update LESSONS_LEARNED / adjust this file)

| File | Purpose | Write When |
|------|---------|------------|
| `LESSONS_LEARNED.md` | curated wisdom + corrections | reusable insight gained |
| `ITERATION_LOG.md` | raw session journal, append-only | every iteration |

Rules: never delete from ITERATION_LOG. Obsolete lessons → Archive in LESSONS_LEARNED. Date-stamp YYYY-MM-DD. When in doubt: log it.

### Periodic Maintenance
Config files audited periodically via `SETUP_AI_AGENT_CONFIG.md`.
See "Periodic Maintenance Protocol" section.

## Sub-Agents

`.claude/agents/`. Invoke proactively.

| Agent | File | When |
|-------|------|------|
| Psychologist | `.claude/agents/psychologist.md` | emotion models, descriptions, crisis logic review |
| Senior Software Engineer | `.claude/agents/senior-software-engineer.md` | architecture, implementation strategy, technical tradeoffs |
| Code Simplifier | `.claude/agents/code-simplifier.md` | post-implementation refinement, refactoring |
| UX Expert | `.claude/agents/ux-expert.md` | layout, interaction design, a11y, responsive |
| Planner | `.claude/agents/planner.md` | complex multi-step features, cross-cutting changes |
| Agent Creator | `.claude/agents/agent-creator.md` | new agent needed for recurring domain |
