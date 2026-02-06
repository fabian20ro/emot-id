# Emot-ID — Implementation Roadmap

Clean-slate roadmap derived from multi-perspective analysis (2026-02-07).
For rationale, conflict resolutions, and detailed recommendations, see **ANALYSIS.md**.

---

## Phase 0 — Live UI/UX Critical Issues (Browser-Verified)

Found via live app audit on mobile viewport (393×742). These are immediate UX/accessibility defects that should be fixed first.

- [ ] **0.1** Fix sub-44px onboarding controls (primary CTA and skip)
  Evidence: onboarding Next renders at ~78×36 and Skip at ~24×16 on 393×742.
  `Onboarding.tsx` — enforce minimum touch target + stronger visual affordance for skip action.
  _30 min_

- [ ] **0.2** Fix sub-44px SessionHistory close and footer action controls
  Evidence: close glyph and footer actions (Clear all data, Share with therapist, Export JSON) render with text-height hit areas (~16–18px), below mobile target standards.
  `SessionHistory.tsx` — convert to padded button containers with explicit `min-h-[44px]` and accessible labels.
  _45 min_

- [ ] **0.3** Fix sub-44px ResultModal close action
  Evidence: result modal close (×) hit target is ~15×24.
  `ResultModal.tsx` — replace with 44×44 icon button and proper focus/hover states.
  _20 min_

- [ ] **0.4** Fix low-prominence critical action in onboarding
  Evidence: Skip is visually de-emphasized to near-background contrast and too small, creating discoverability imbalance and accidental linear flow pressure.
  `Onboarding.tsx` — maintain secondary styling but raise contrast and hit area; keep clear secondary CTA semantics.
  _20 min_

- [ ] **0.5** Improve dismissibility and semantics of `DontKnowModal`
  Evidence: modal has no explicit close button; dismissal relies on backdrop/Escape only.
  `DontKnowModal.tsx` — add visible close control (44×44), `aria-labelledby`, and consistent modal header pattern.
  _45 min_

## Phase 1 — UI/Layout Baseline Fixes

Do this before later phases to stabilize interaction quality and layout consistency across the app.

- [ ] **1.1** Unify modal architecture with a shared shell
  New `ModalShell` abstraction (portal + backdrop + focus trap + safe-area-aware max height + internal scroll handling), then migrate:
  `ResultModal.tsx`, `DontKnowModal.tsx`, `SessionHistory.tsx`, `SensationPicker.tsx`
  _6 hours_

- [ ] **1.2** Remove raw z-index usage and enforce tokenized layering
  Replace raw z classes with CSS variables from `index.css`:
  `DontKnowModal.tsx` (`z-50`), `App.tsx` hint overlay (`z-10`), `ModelBar.tsx` indicator (`z-10`)
  _1 hour_

- [ ] **1.3** Complete 44px touch-target audit for all actionable controls
  Add `min-h-[44px]`/`min-w-[44px]` where missing:
  `Onboarding.tsx` (Back/Next/Skip), `ResultModal.tsx` (close + follow-up actions), `SessionHistory.tsx` (close + footer actions), `GuidedScan.tsx` (skip/continue controls), `VisualizationErrorBoundary.tsx`, `UndoToast.tsx`, `DontKnowModal.tsx`, `MicroIntervention.tsx`
  _4 hours_

- [ ] **1.4** Improve modal accessibility semantics and explicit close affordances
  Add visible close affordance + labels where missing, and normalize dialog labeling (`aria-labelledby`):
  `DontKnowModal.tsx`, `SessionHistory.tsx`, `ResultModal.tsx`
  _2 hours_

- [ ] **1.5** Make overlays and toasts safe-area aware on small devices
  Apply bottom inset/padding patterns to avoid clipped actions on notched phones:
  `ResultModal.tsx`, `SessionHistory.tsx`, `SensationPicker.tsx`, `UndoToast.tsx`, `Onboarding.tsx`
  _2 hours_

- [ ] **1.6** Prevent small-screen overflow in text-heavy dialogs
  Add constrained-height + scroll behavior so long i18n strings don't push actions off-screen:
  `Onboarding.tsx`, `DontKnowModal.tsx`, `GuidedScan.tsx` (pause/complete cards)
  _2 hours_

- [ ] **1.7** Remove layout jump caused by SelectionBar mount/unmount
  `SelectionBar.tsx`, `App.tsx` — keep reserved vertical space (collapsed placeholder/min-height) so visualization doesn't reflow abruptly when first selection appears or is cleared
  _1.5 hours_

- [ ] **1.8** Improve SessionHistory UX labels (not raw IDs)
  `SessionHistory.tsx` — show localized model names and localized body-region labels instead of raw `modelId` / `regionId` strings; add mapping helper from registry/somatic data
  _2 hours_

## Phase 2 — Safety-Critical

Must ship before any other work. Items ordered so each builds on the previous.

- [ ] **2.1** Remove onboarding skip button
  `Onboarding.tsx` — delete skip button (lines 104-112), remove `onboarding.skip` i18n key
  _15 min_

- [ ] **2.2** Suppress AI link entirely during crisis
  `ResultModal.tsx` — remove the demoted AI link when `crisisTier !== 'none'` (lines 262-289)
  _15 min_

- [ ] **2.3** Add tier-4 suicide risk routing
  `distress.ts` — add `SUICIDE_RISK_COMBOS` (triple-emotion sets), extend `getCrisisTier` to return `'tier4'`
  `CrisisBanner.tsx` — new tier-4 variant: red banner, explicit language, acknowledgment gate before results
  `ResultModal.tsx` — render tier-4 gate, suppress opposite action + micro-intervention + AI link
  i18n: `crisis.tier4`, `crisis.tier4Acknowledge` (en + ro)
  _2 hours_

- [ ] **2.4** Add temporal escalation disclosure
  `CrisisBanner.tsx` — when tier was escalated by temporal pattern, show disclosure note
  `ResultModal.tsx` — pass `wasEscalated` boolean to CrisisBanner
  i18n: `crisis.temporalNote` (en + ro)
  _1 hour_

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
