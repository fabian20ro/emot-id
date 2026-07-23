# Remaining Mobile Migration Plan

Status: prioritized after completing Word Ladder, July 23, 2026.

## Completed Since Last Update

- Repaired Affect Map placement: nearby words now appear as visible pins and persistent controls in
  normal flow, outside sticky-action overlap.
- Replaced Plutchik's generic bubble scatter with a stable eight-emotion wheel, two-choice gating,
  and inline combination feedback while preserving the existing analyzer.
- Replaced generic "Optional theory" subtitles with route-specific Explore descriptions.
- Made external AI search links allowed by default while preserving an explicit user opt-out.
- Replaced the reachable Emotional Vocabulary and Unpack a Moment modal windows with normal routed
  screens. Their model/data behavior remains local and unchanged.
- Replaced abstract Today copy with a direct question and concrete next choices in both languages.
- Removed Settings from active check-ins and Reflection so utility navigation cannot silently
  discard route-local work; screen Back and crisis support remain available.
- Extracted `WordLadderScreen`, added exact one-level hierarchy Back, selectable ancestor levels,
  removable selections, semantic list controls, and bilingual browser coverage.
- Added optional user-driven comparison between the selected word and one unranked sibling from
  the same visible level, using existing catalog descriptions and neutral wording.
- Made inferred needs user-selectable in Reflection: one need starts selected, while multiple
  suggestions require an explicit optional choice that persists into Journal and JSON export.

## Constraints

- Keep `App` as the single completion, crisis, reflection, and persistence boundary.
- Keep route input state local unless a proven interruption case requires lifting it.
- Reuse model analyzers, catalog data, storage, and typed navigation.
- Add an abstraction only after two production callers need the same behavior.
- No backend, AI API, React Router, generic wizard/state machine, datastore rewrite, or broad design-system project.
- Every user-facing copy change updates English and Romanian together.

## Completed: Protect In-Progress Check-Ins

Settings is hidden during check-in and Reflection. Back remains the explicit exit, tier-4 support
stays in the Reflection content, and preferences are changed only after leaving the workflow.
No draft persistence or navigation-state framework was added.

## Completed: Word Ladder

The inline ladder is now `WordLadderScreen`; it preserves the Wheel analyzer, keeps hierarchy
history local, returns one level at a time, and allows any visited ancestor or precise leaf to be
selected. Selection-time context retains that exact sibling level for optional comparison without
calculating similarity or changing the model contract.

**Tests:** broad and precise completion, hierarchy Back, English and Romanian comparison, keyboard
selection, dark contrast, mobile bounds, no-overlap geometry, and shared crisis completion.

## Completed: Make Needs User-Selectable

Reflection now presents the deduplicated inferred-needs set as a removable single-select control.
Exactly one need starts selected; multiple needs start empty. The existing optional `selectedNeed`
field carries the choice through the shared save boundary into Journal detail and JSON export.
No taxonomy, mapping layer, or next-step behavior changed.

**Tests:** no need, one need, deduplicated multiple needs, keyboard selection, clearing,
save-disabled behavior, English/Romanian copy, session detail, JSON export, dark contrast, mobile
bounds, and tier-4 gating.

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

Plutchik has a route-specific wheel, Explore has meaningful route descriptions, and vocabulary
practice now uses a normal screen. The remaining dark modal components (`QuickCheckIn`,
`ResultModal`, `SessionHistory`, `SettingsMenu`, `DontKnowModal`, and their `InfoButton` content)
are not reachable from the current App shell. Delete them only after an import-graph audit confirms
that tests and compatibility exports are their only callers. Do not restyle dead code.

## Deferred Body Compass Presentation Slice

The current Body Compass Area -> Sensation -> Intensity -> Review flow is already screen-based.
The remaining old visual style lives inside the shared `BodyMap` and its legacy fallback paths.

1. Extract a presentation-only `BodyRegionMap` from `BodyMap`. It should receive regions,
   selections, side, and `onRegionActivate`; no picker, guided-flow, or model orchestration state.
2. Replace hardcoded gray/indigo SVG fills, strokes, and labels with semantic light/dark body-map
   tokens. Preserve region hit paths and 44px-equivalent targets.
3. Keep the existing Body Compass inline sensation and intensity steps. Once every active caller
   uses `onRegionActivate`, remove the internal `SensationPicker` bottom-sheet fallback.
4. Decide Guided Scan placement separately. If retained, make it a route-local Body Compass mode,
   not an overlay inside the map. Do not combine this decision with the map color refactor.
5. Remove compact `IntensityPicker` and old picker motion only after caller search and parity tests
   show they are unused.

**Verification:** front/back map at 360x800, 393x742, and 430x932; light/dark computed contrast;
keyboard and screen-reader region activation; hit-path regression tests; Area -> Review completion;
Back/edit/remove/add-another paths; no change to somatic scoring or shared crisis completion.

## P6: Release Hardening

- Romanian journey matrix for all primary routes.
- Keyboard-only, focus restoration, reduced motion, offline, and save-disabled coverage.
- Crisis fixture matrix through Quick, Body, Affect, Words, and Plutchik.
- Mobile geometry at 360x800, 393x742, and 430x932 plus one desktop sanity viewport.
- Keep Chromium and WebKit Playwright green in GitHub Actions before deployment.

## Recommended Sequence

1. P3 Guide Me: reduce uncertainty without speculative intelligence.
2. P4 Journal trust, then P5 legacy removal.
3. P6 hardening continuously, with the full matrix before release.

## Recommended Next Update

Implement P3 inside `ArrivalScreen` with local state and one exported pure decision function:

1. First ask whether a body sensation is clear enough to locate. A clear yes returns Body; a
   no/not-yet answer reveals one second question.
2. Ask whether the feeling can be placed by energy and pleasantness without naming it. Yes returns
   Affect; otherwise offer broad Words.
3. Keep an explicit return to the standard route list at both questions. Do not persist answers,
   inspect history, score uncertainty, or reorder route cards.
4. Keep the current `onChoose` navigation contract. No new route, generic wizard, state machine,
   or shared questionnaire abstraction.
5. Unit-test every decision-table path. Playwright-test Back, keyboard operation, Romanian copy,
   direct route handoff, mobile bounds, and choosing no answer.
