# Emot-ID — Implementation Roadmap

Clean-slate roadmap derived from multi-perspective analysis (2026-02-07).
For rationale, conflict resolutions, and detailed recommendations, see **ANALYSIS.md**.

---

## Phase 0 — Pixel 9a Layout Blockers (393×742)

Ordered from your screenshots + live browser verification, focused on the exact mobile viewport budget.

- [x] **0.1** Spread Wheel/Plutchik emotion chips across the full canvas instead of top clustering
  Fix applied in `BubbleField.tsx` by making the visualization wrapper consume full available height on compact mobile.
  _Done_

- [x] **0.2** Keep Somatic feet (`Tălpi`) visible after selecting regions
  Fix applied in `BodyMap.tsx` + `body-paths.ts` by recovering vertical space (upward map shift + shorter throat geometry).
  _Done_

- [x] **0.3** Prevent body label text from exiting the pill and enlarge tap area
  Fix applied in `BodyMap.tsx` via adaptive pill width, selective text compression for long labels, and 44px hit rectangles.
  _Done_

- [ ] **0.4** Fix onboarding mobile tap targets + visibility
  Next/Skip still need stronger minimum target and skip contrast consistency in onboarding.
  `Onboarding.tsx`
  _30 min_

- [ ] **0.5** Fix sub-44px SessionHistory close and footer actions
  `SessionHistory.tsx` — close icon and footer actions currently text-height sized.
  _45 min_

- [ ] **0.6** Fix sub-44px ResultModal close action
  `ResultModal.tsx` — replace small `×` target with explicit 44×44 button.
  _20 min_

- [ ] **0.7** Improve dismissibility + semantics of `DontKnowModal`
  Add explicit close button and normalize dialog labeling (`aria-labelledby`).
  `DontKnowModal.tsx`
  _45 min_

- [ ] **0.8** Remove visualization jump when SelectionBar appears/disappears
  Reserve space or keep collapsed placeholder so model canvases don’t reflow abruptly.
  `SelectionBar.tsx`, `App.tsx`
  _1.5 hours_

## Phase 1 — Safety-Critical (from ANALYSIS.md)

Must ship before feature work; derived from `ANALYSIS.md` section 9.3 Phase 0.

- [ ] **1.1** Add tier-4 suicide risk routing
  `distress.ts`, `CrisisBanner.tsx`, `ResultModal.tsx`, i18n keys `crisis.tier4`, `crisis.tier4Acknowledge`
  _2 hours_

- [ ] **1.2** Remove onboarding skip button
  `Onboarding.tsx` + remove `onboarding.skip` key
  _15 min_

- [ ] **1.3** Add temporal escalation disclosure
  `CrisisBanner.tsx`, `ResultModal.tsx`, i18n key `crisis.temporalNote`
  _1 hour_

- [ ] **1.4** Suppress AI link entirely during crisis
  `ResultModal.tsx`
  _15 min_

## Phase 2 — UI/Layout Baseline Fixes

System-level cleanup after Pixel 9a blockers so layout behavior is consistent across screens.

- [ ] **2.1** Unify modal architecture with shared shell
  `ResultModal.tsx`, `DontKnowModal.tsx`, `SessionHistory.tsx`, `SensationPicker.tsx`
  _6 hours_

- [ ] **2.2** Remove raw z-index usage and enforce tokenized layering
  `DontKnowModal.tsx` (`z-50`), `App.tsx` hint overlay, `ModelBar.tsx` indicator
  _1 hour_

- [ ] **2.3** Complete 44px touch-target audit for remaining actionable controls
  `Onboarding.tsx`, `ResultModal.tsx`, `SessionHistory.tsx`, `GuidedScan.tsx`, `VisualizationErrorBoundary.tsx`, `UndoToast.tsx`, `DontKnowModal.tsx`, `MicroIntervention.tsx`
  _4 hours_

- [ ] **2.4** Improve modal accessibility semantics and explicit close affordances
  `DontKnowModal.tsx`, `SessionHistory.tsx`, `ResultModal.tsx`
  _2 hours_

- [ ] **2.5** Make overlays and toasts safe-area aware on small devices
  `ResultModal.tsx`, `SessionHistory.tsx`, `SensationPicker.tsx`, `UndoToast.tsx`, `Onboarding.tsx`
  _2 hours_

- [ ] **2.6** Prevent small-screen overflow in text-heavy dialogs
  `Onboarding.tsx`, `DontKnowModal.tsx`, `GuidedScan.tsx`
  _2 hours_

- [ ] **2.7** Improve SessionHistory UX labels (not raw IDs)
  Localized model names and body-region labels instead of raw IDs
  `SessionHistory.tsx`
  _2 hours_

## Phase 3 — High-Value Features

Next development cycle. Ordered for efficiency: shared data-layer changes first, then UI.

- [ ] **3.1** Fix guilt opposite action text
  `opposite-action.ts` — rewrite guilt suggestion to remove ambiguous "do it again" clause, add complexity preamble
  i18n: bilingual update (inline in file)
  _30 min_

- [ ] **3.2** Post-intervention effectiveness check
  `types.ts` — add `interventionResponse?: 'better' | 'same' | 'worse'` to `Session`
  `MicroIntervention.tsx` — add "How do you feel now?" screen after exercise completes (Better / Same / Worse); "Worse" shows validation message
  `ResultModal.tsx` — pass intervention response into session save
  i18n: `intervention.checkPrompt`, `intervention.checkBetter`, `intervention.checkSame`, `intervention.checkWorse`, `intervention.worseValidation` (en + ro)
  _3 hours_

- [ ] **3.3** Randomize bubble order on each render
  `bubble-layout.ts` — shuffle emotion array before mobile deterministic row-wrapping (preserves organic jitter, eliminates positional bias)
  _1 hour_

- [ ] **3.4** Quick check-in mode
  New `QuickCheckIn.tsx` — curated grid of 8-12 common emotions (must include distress emotions for crisis routing), tap 1-3, brief synthesis, done in <30 sec
  `App.tsx` — entry point (e.g. gesture or prominent button), route through full `getCrisisTier` pipeline
  `distress.ts` — ensure crisis detection works with quick-mode result IDs
  i18n: `quickCheckIn.title`, `quickCheckIn.prompt`, `quickCheckIn.done` (en + ro)
  _8 hours_

- [ ] **3.5** Model progression nudges in SessionHistory
  `SessionHistory.tsx` — after 3+ sessions with one model, show dismissible suggestion to try a different model (soft, directional, framed as growth)
  i18n: `history.progressionNudge`, `history.progressionSomatic`, `history.progressionWheel`, `history.progressionPlutchik`, `history.progressionDimensional` (en + ro, partially defined already)
  _3 hours_

- [ ] **3.6** Document somatic signal weight provenance
  `somatic/data.json` — add `source` field to each emotion signal: `"Nummenmaa2014"`, `"clinical"`, or `"interpolated"`
  Research task, no UI change.
  _4 hours_

## Phase 4 — Enhancements

Backlog. Items are independent — implement in any order.

- [ ] **4.1** Randomize sensation order
  `SensationPicker.tsx`, `GuidedScan.tsx` — shuffle `commonSensations` array before rendering to mitigate primacy bias
  _30 min_

- [ ] **4.2** Add theoretical attribution to model descriptions
  Model `index.ts` files — update `description` field to include source: "Based on Plutchik (1980)", "Russell (1980)", "Parrott (2001)", "Nummenmaa et al. (2014)"
  i18n: bilingual description updates (inline)
  _1 hour_

- [ ] **4.3** Weekly valence trend (4-week sparkline)
  `valence-ratio.ts` — extend to return 4 weeks of data
  `SessionHistory.tsx` — render as stacked bars or sparkline
  _4 hours_

- [ ] **4.4** Interoception development guidance
  `GuidedScan.tsx` — when `skipCount >= 6` at scan completion, show interoception development tips instead of generic "nothing normal" message
  i18n: `somatic.interoceptionTip`, `somatic.interoceptionTip2`, `somatic.interoceptionTip3` (en + ro)
  _2 hours_

- [ ] **4.5** Hide DimensionalField axis labels after first use
  `DimensionalField.tsx` — on mobile, hide axis labels after user's first interaction (or first session); uses localStorage flag
  _1 hour_

- [ ] **4.6** Evaluate constriction/tension merge
  `somatic/types.ts`, `somatic/data.json` — assess whether users can reliably discriminate constriction from tension; merge if not. Requires user-testing data to decide.
  _6 hours (if merging)_

- [ ] **4.7** Emotional granularity training mode
  New component + data file — present 2-3 similar emotions, ask user to discriminate ("Which best describes what you feel?"). Optional practice mode accessible from SettingsMenu.
  i18n: `granularity.title`, `granularity.prompt`, `granularity.notSure`, `granularity.practice` (en + ro)
  _8 hours_

## Phase 5 — Long-Term

Requires Phase 3 foundations to be solid.

- [ ] **5.1** Model selection on first launch
  `Onboarding.tsx`, `App.tsx` — replace default-to-Somatic with an explicit model selection step after onboarding screen 3 (which already describes the models)
  _4 hours_

- [ ] **5.2** Active vs. passive vocabulary tracking
  `vocabulary.ts` — distinguish emotions from analysis results (active) vs. merely selected (passive); surface "your 15 most-identified emotions" in SessionHistory
  `SessionHistory.tsx` — update vocabulary display
  _4 hours_

- [ ] **5.3** Validate somatic scoring against Nummenmaa maps
  New test file `somatic-validation.test.ts` — for each emotion Nummenmaa studied, create synthetic selections matching published activation patterns, verify scoring ranks that emotion in top results
  _8 hours_

- [ ] **5.4** Optional check-in reminders (PWA notifications)
  New notification service module — opt-in daily reminder, default off, easy opt-out
  `SettingsMenu.tsx` — add reminder toggle
  i18n: new `reminders` section (en + ro)
  _6 hours_

- [ ] **5.5** Chain analysis mode (DBT)
  New feature — skill-building UI: triggering event, vulnerability factors, prompting event, emotion, urge, action, consequence. Requires Phase 1 foundation (quick check-in, intervention checks).
  _Estimate TBD_

- [ ] **5.6** Simple language mode
  Language-level toggle substituting simpler labels and shorter descriptions for users with lower vocabulary or accessibility needs.
  _Estimate TBD_

## Technical Debt (unscheduled, implement when convenient)

- [ ] Lazy loading models — `React.lazy` + `Suspense` for code splitting (somatic data.json is largest)
- [ ] PWA offline indicator — show banner when using cached content (skip custom install prompt)

---

## Dropped

- ~~E.5 Master combination model~~ — no theoretical basis for merging incommensurable frameworks; cross-model bridges serve this need better

## Reference

**ANALYSIS.md** is the authoritative reference for rationale, conflict resolutions, psychological grounding, i18n key specifications, and Pixel 9a layout constraints. Consult it when implementation details are ambiguous.
