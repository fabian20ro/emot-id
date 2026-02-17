# Emot-ID Agent Playbook

Interactive emotion-identification PWA (React 19, TypeScript 5.9, Vite 7, Tailwind 4, Framer Motion 12, vite-plugin-pwa). Deploy target is GitHub Pages under `/emot-id/`.

## Mission

Build and evolve Emot-ID as a modular, safe, clinically respectful, privacy-first, mobile-first product. Favor correctness, resilience, and UX clarity over speed hacks.

## Operating Priorities

1. Safety and correctness
2. Accessibility and UX quality
3. Extensibility and maintainability
4. Performance and bundle discipline
5. Delivery speed

## Agentic Workflow (Required)

1. **Recon**
   - Read relevant codemaps/docs before editing.
   - If prioritization is involved, read `ANALYSIS.md` and `TODOS.md` directly before planning.
   - Read `LESSONS_LEARNED.md` and apply any relevant prevention checklist.
   - Confirm actual behavior in source, not assumptions.
2. **Plan**
   - Split work into small, verifiable units.
   - Identify risks: safety regressions, i18n gaps, mobile/accessibility regressions, state persistence side effects.
3. **Implement**
   - Keep modules cohesive and composable.
   - Prefer pure functions for domain logic; keep React components thin.
4. **Validate**
   - Run targeted tests first, then broader suite as needed.
   - Manually sanity-check critical UX flows (onboarding, model switching, analysis modal, crisis surfaces, settings/history).
5. **Document**
   - Update docs for any behavior/architecture change in the same PR.
   - Never leave codemaps stale after structural changes.

## Lessons Loop (Required)

- Two-file memory system: `LESSONS_LEARNED.md` (curated wisdom) + `ITERATION_LOG.md` (append-only session journal).
- **Start of task:** Read `LESSONS_LEARNED.md` before writing any code.
- **End of iteration:** Always append to `ITERATION_LOG.md`. If the insight is reusable, also add to `LESSONS_LEARNED.md`.
- **Pattern detection:** If the same issue appears 2+ times in the log, promote it to a lesson.
- Never delete from `ITERATION_LOG.md`. Obsolete lessons go to the Archive section in `LESSONS_LEARNED.md`.

## Skills and Subagents

- Use available skills whenever the task matches a skill description.
- If multiple skills apply, use the smallest set that covers the task.
- For complex work, parallelize independent analysis/implementation streams with subagents when available.
- Define clear ownership per stream (files, invariants, acceptance criteria) before parallel execution.
- Reconcile outputs centrally and run one final integration review.

## Architecture Invariants

- Client-only app. No backend and no telemetry pipeline.
- Preferences in `localStorage` via `src/data/storage.ts`.
- Sessions in IndexedDB via `src/data/session-repo.ts` (`idb-keyval`).
- Model system is registry-driven (`src/models/registry.ts`).
- Visualization is selected dynamically per model.
- Fixed overlays must be portaled to `document.body` and focus-trapped.
- Crisis logic must remain deterministic and auditable (`src/models/distress.ts`, `src/data/temporal-crisis.ts`).
- i18n is mandatory for user-facing copy (`src/i18n/en.json`, `src/i18n/ro.json`).

## Extensibility Rules

### New model checklist

1. Add `src/models/<id>/types.ts`, `index.ts`, `data.json`
2. Implement `EmotionModel<E>`
3. Register ID in `src/models/constants.ts`
4. Register model + visualization in `src/models/registry.ts`
5. Add i18n names/descriptions/hints in both language files
6. Add/extend tests for model behavior and analysis

### UI/interaction changes

- Keep 44px minimum touch targets.
- Respect safe-area insets and existing z-index scale in `src/index.css`.
- Preserve keyboard and screen-reader affordances (focus trap, `aria-modal`, live regions).
- Use motion intentionally; honor reduced-motion preferences.

## Safety-Critical Guardrails

- Do not weaken crisis-tier detection or escalation semantics without explicit tests.
- Graduated access: tier1-3 crisis contextualizes (shows resources) but does not gatekeep (hide tools). Only tier4 pre-acknowledgment gates features. Do not reintroduce binary suppression.
- Do not introduce data loss paths when toggling session persistence.
- Do not add outbound network behavior without explicit product/security intent.
- Keep disclaimer and crisis support surfaces reachable and comprehensible.

## Quality Gates

Run the smallest relevant set first, then expand:

| Command | Action |
|---|---|
| `npm run dev` | Vite dev server (`http://localhost:5173/emot-id/`) |
| `npm run build` | Typecheck + production build |
| `npm test` | Vitest (unit/integration) |
| `npm run test:e2e` | Playwright end-to-end |
| `npm run lint` | ESLint |

## Persistence Contracts

### `localStorage` keys

| Key | Purpose |
|---|---|
| `emot-id-model` | Last selected model |
| `emot-id-sound-muted` | Sound mute preference |
| `emot-id-onboarded` | Onboarding completed |
| `emot-id-hint-<modelId>` | First-interaction hint dismissed for model |
| `emot-id-language` | UI language (`ro` or `en`) |
| `emot-id-save-sessions` | Session-saving preference (default `true`) |

## Data Integrity Notes

- Plutchik dyad `nostalgia` uses `[serenity, sadness]` (distinct from bittersweetness).
- Plutchik `compassion` uses `[trust, sadness]` to preserve reachability.
- Plutchik duplicate `aggressiveness` was removed in favor of `ruthlessness`.
- Wheel replaced non-emotion label `busy` with `overwhelmed`.
- Dimensional model includes extra unpleasant-calm emotions to reduce quadrant sparsity.

## Docs Map

| Need | Read |
|---|---|
| Conventions and contribution workflow | `docs/CONTRIB.md` |
| Architecture and data flow | `docs/CODEMAPS/architecture.md` |
| Model contracts and scoring | `docs/CODEMAPS/models.md` |
| Component and interaction map | `docs/CODEMAPS/frontend.md` |
| Build/deploy/troubleshooting | `docs/RUNBOOK.md` |
