# Remaining Mobile Migration Plan

Status: P5 complete; Body Compass presentation and P6 remain, July 23, 2026.

## Completed Since Last Update

- Localized stored body-region and sensation IDs at display time, completed Journal body/need/step
  detail, and added explicit loading/error/empty states without mutating old records.
- Replaced sessions-only export/delete with versioned full-data behavior covering sessions, chain
  entries, preferences, and dynamic hints; destructive confirmation is now portaled and focus-trapped.
- Replaced Guide Me route reordering with two concrete, deterministic questions that hand off
  directly to Body, Affect, or Words while preserving an explicit no-answer return.
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
- Removed the unreachable modal-era Quick Check-in, results, history, settings, uncertainty,
  intervention, and sessions-only export presentation after tracing every production caller.

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

## Completed: Make Guide Me Deterministic

Guide Me now asks whether a body signal can be located, then only when needed asks whether the
feeling can be placed without a name. A pure decision function returns Body, Affect, or Words.
Answers remain local and disposable; Back moves exactly one question, and every question offers
the unchanged standard route list without forcing an answer.

**Tests:** every decision path, direct handoff to all three routes, keyboard operation, exact Back,
Romanian copy, dark contrast, mobile bounds, and no forced answer.

## Completed: Strengthen Journal Data Trust

Raw body-region and sensation IDs remain unchanged in stored records and exports; a shared somatic
display helper localizes them in Journal patterns and detail. Detail also shows selected needs and
next steps when present while old records retain a clear fallback.

Export now uses a versioned envelope with a fresh repository read of sessions and chain entries plus
a resolved preference snapshot. Delete clears both IndexedDB stores, resets persisted preferences
and dynamic hint state, and preserves only non-preference onboarding completion. Its confirmation
uses the existing body portal and focus trap.

**Tests:** old record compatibility, complete export/delete and reload, preference reset, no data
mutation during viewing, EN/RO body display, empty/loading/error states, focus restoration, dark
contrast, and mobile dialog bounds.

## Completed: Finish Explore and Remove Legacy Presentation

The import graph confirmed that `QuickCheckIn`, `ResultModal`, `SessionHistory`, `SettingsMenu`,
`DontKnowModal`, and their private result/intervention/toggle/info/export helpers had no production
route. Their dedicated tests and 13 unused translation namespaces were deleted with them.

Active journal analytics, session repository compatibility, `ModalShell`, focus trapping, crisis
logic, model analyzers, and the entire Body Compass dependency tree remain. Codemaps now describe
the routed screen architecture instead of the removed modal shell.

**Verification:** `npm run check` passes 68 files and 637 tests. `npm run test:e2e` passes all 80
Mobile Safari and Mobile Chrome cases, including explicit zero-dialog checks for migrated utility
screens. Manual 393x742 dark inspection confirmed readable, bounded Today and delete-confirmation
states. Main CSS fell from 81.70 to 65.20 kB and main JS from 473.84 to 463.19 kB.

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

1. Deferred Body Compass presentation, now that active legacy code is removed.
2. P6 hardening continuously, with the full matrix before release.

## Recommended Next Update

Implement the first Body Compass presentation slice without changing its staged workflow:

1. Extract only the region SVG and hit-area behavior into `BodyRegionMap`; keep route orchestration,
   sensation, intensity, review, scoring, and crisis completion unchanged.
2. Add semantic body-map tokens for light/dark fills, strokes, selected regions, and labels. Preserve
   the current front/back paths and expanded hit areas exactly.
3. Switch `BodyCompassScreen` to the extracted map and verify Area -> Sensation -> Intensity ->
   Review, Back, edit, remove, side switching, and add-another behavior before deleting anything.
4. Audit `BodyMap` callers after the switch. Remove its internal `SensationPicker` fallback and
   compact `IntensityPicker` only if no production caller remains; otherwise record the boundary.
5. Keep Guided Scan unchanged and separate. Its product placement needs a distinct decision and
   should not expand this visual refactor.
6. Run model/scoring unit tests, the full check, Body Compass Playwright at all three mobile sizes,
   dark computed contrast, keyboard activation, and the shared crisis completion journey.
