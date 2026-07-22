# Remaining Mobile Migration Plan

Status: prioritized after the Body Compass slice, July 22, 2026.

## Constraints

- Keep `App` as the single completion, crisis, reflection, and persistence boundary.
- Keep route input state local unless a proven interruption case requires lifting it.
- Reuse model analyzers, catalog data, storage, and typed navigation.
- Add an abstraction only after two production callers need the same behavior.
- No backend, AI API, React Router, generic wizard/state machine, datastore rewrite, or broad design-system project.
- Every user-facing copy change updates English and Romanian together.

## P0: Protect In-Progress Check-Ins

**Problem:** Opening Settings unmounts the active route and discards its local draft.

**Smallest useful change:** Hide the Settings entry during check-in and Reflection. Keep Back as
the explicit exit. Do not add resumable draft persistence until product requirements demand it.

**Tests:** active routes expose no utility interruption; Back remains available; crisis Support
remains reachable; tab and browser navigation behavior stays deterministic.

## P1: Finish Word Ladder

Extract the inline ladder into `WordLadderScreen`. Preserve the Wheel hierarchy and analyzer.
Add one-level-at-a-time Back, selection at any level, and a nearby-word comparison using existing
catalog descriptions or granularity triads. Do not build a similarity graph or recommender.

**Tests:** broad and precise completion, hierarchy Back, comparison in both languages, dark
contrast, mobile bounds, and shared crisis completion.

## P2: Make Needs User-Selectable

Reflection currently saves the first inferred need. Present the small deduplicated need set as a
single-select control and persist the existing optional `selectedNeed` field. Keep suggested next
steps derived from the chosen need only where current mappings already exist.

**Tests:** no need, one need, multiple needs, save-disabled behavior, session detail, export, and
tier-4 gating.

## P3: Make Guide Me Deterministic

Replace route reordering with at most two concrete questions about the clearest available signal.
Use a pure decision table that returns Body, Affect, or Words. No personalization engine, scoring,
history-based inference, or new persistence.

**Tests:** every answer path, keyboard operation, Back, Romanian copy, and no forced answer.

## P4: Strengthen Journal Data Trust

Localize serialized body-region and sensation display, show selected needs and next steps in
session detail, and include chain entries/preferences in export and delete behavior. Confirmation
dialogs remain portaled and focus-trapped.

**Tests:** old record compatibility, complete export/delete, no data mutation during viewing, and
empty/loading/error states.

## P5: Finish Explore and Remove Legacy Presentation

Move model guides and practice into normal screens one route at a time. Keep Plutchik as an
advanced workspace. Remove legacy sheets and unused orchestration only after parity tests prove
each replacement.

## P6: Release Hardening

- Romanian journey matrix for all primary routes.
- Keyboard-only, focus restoration, reduced motion, offline, and save-disabled coverage.
- Crisis fixture matrix through Quick, Body, Affect, Words, and Plutchik.
- Mobile geometry at 360x800, 393x742, and 430x932 plus one desktop sanity viewport.
- Keep Chromium and WebKit Playwright green in GitHub Actions before deployment.

## Recommended Sequence

1. P0 interruption guard: small, high-confidence data-loss prevention.
2. P1 Word Ladder: largest remaining primary-route UX gap.
3. P2 selectable needs: restores agency in Reflection.
4. P3 Guide Me: reduce uncertainty without speculative intelligence.
5. P4 Journal trust, then P5 legacy removal.
6. P6 hardening continuously, with the full matrix before release.
