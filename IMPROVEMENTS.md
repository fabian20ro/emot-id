# Emot-ID Improvement Backlog

## Completed

### Phase 1: Safety & Reflection Layer
- [x] Post-analysis reflection ("Does this feel right?" -> Yes / Partly / Not quite)
- [x] Crisis resources for high-distress emotion combinations (116 123, findahelpline.com)
- [x] App disclaimer in settings menu
- [x] AI warning text below "Learn more" link
- [x] Replace "Explore with AI" with interstitial warning approach
- [x] `needs` field added to `AnalysisResult` and `BaseEmotion` types
- [x] `matchStrength` field added to `AnalysisResult`
- [x] `needs` data written for all Plutchik emotions (48 entries)
- [x] `needs` data written for all Wheel emotions (130 entries)
- [x] `needs` data written for all Somatic regions (14 regions) + `emotionNeeds` for emotion signals
- [x] Somatic scoring: absolute score floor (STRONG_FLOOR=1.0, POSSIBLE_FLOOR=0.6)
- [x] Somatic scoring: `emotionNeeds` passthrough in results
- [x] Plutchik and Wheel `analyze()` pass `needs` through to results
- [x] ResultModal: needs display, match strength badge, collapsible descriptions for 3+ results
- [x] 6 new tests for ResultModal (reflection, crisis, needs, matchStrength, AI warning)

### Phase 2: Enrich Existing Models
- [x] GuidedScan: structured breathing cues (breathe in / breathe out synced to animation)
- [x] GuidedScan: "Take more time" button (extends centering from 10s to 30s)
- [x] GuidedScan: body-group skip option (skip head/neck/torso/arms/legs as a group)

---

## Known Issues

*All known issues resolved in Sprint 2.*

### Body Map Meditation Pose
- [x] Redesigned SVG body silhouette as meditation pose (cross-legged, hands resting on knees)
- [x] ViewBox compressed from 200×440 to 200×320 — better fit for phone screens

---

## Remaining Work (Sprint-Based)

### Sprint 1: Safety Net -- Tests for Untested Components ✅
*Write tests BEFORE refactoring or fixing bugs. These are the regression safety net.*

- [x] `src/__tests__/BodyMap.test.tsx` -- 8 tests (region render, picker flow, deselect, guided scan)
- [x] `src/__tests__/GuidedScan.test.tsx` -- 15 tests (centering, breath cycle, scanning, sensation/intensity, skip, group skip, complete)
- [x] `src/__tests__/SensationPicker.test.tsx` -- 9 tests (2-step flow, back, cancel, "Nothing here")

Coverage: ~55% -> ~70%.

---

### Sprint 2: Bug Fixes + Refactoring (Known Issues 1-3 + duplication cleanup) ✅

#### 2a: Extract shared components ✅
- [x] `src/components/IntensityPicker.tsx` -- shared intensity UI (detailed + compact variants)
- [x] Updated SensationPicker and GuidedScan to use IntensityPicker

#### 2b: Fix Known Issue #2 -- Sensation picker off-screen on mobile ✅
- [x] Redesigned SensationPicker as bottom drawer/sheet with slide-up animation
- [x] Updated BodyMap (removed position calculation, simplified click handler)

#### 2c: Fix Known Issue #3 -- Wheel leaf emotions too small ✅
- [x] Updated `getEmotionSize()`: visible count <= 4 -> large; <= 8 -> medium minimum

#### 2d: Fix Known Issue #1 -- Head region too small ✅
- [x] Added `hitD` expanded hit area path to body-paths.ts
- [x] Updated BodyRegion.tsx to render transparent hit area behind visible path

#### 2e: Minor type cleanup ✅
- [x] Made `onDeselect` required in VisualizationProps
- [x] Documented BodyMap cast in registry.ts (needed due to SomaticSelection variance)

---

### Sprint 3: First-Use Onboarding ✅

3-screen overlay shown once (localStorage flag `emot-id-onboarded`):
1. "This is an exploration, not a test"
2. "Every emotion has a purpose"
3. "Choose your way in" (model overview)

- [x] `src/components/Onboarding.tsx` -- 3-screen overlay with skip, bilingual, step indicators
- [x] Updated App.tsx to render Onboarding conditionally
- [x] Added onboarding strings to en.json and ro.json
- [x] `src/__tests__/Onboarding.test.tsx` -- 8 tests (navigation, skip, localStorage, back button)

---

### Sprint 4: Emotional Profile Synthesis ✅

Rule-based narrative for multi-emotion results. Transforms from labeling tool to reflection tool.

- [x] `src/models/synthesis.ts` -- pure `synthesize(results, language)` function with 5 rules: valence balance, intensity pattern, complexity framing, adaptive function weaving, needs integration
- [x] Updated ResultModal with synthesis card (neutral `bg-gray-700/50`) above individual results
- [x] `src/__tests__/synthesis.test.ts` -- 11 tests (empty, single/multi emotion, valence detection, intensity bands, complexity, needs, bilingual, anti-diagnostic)

---

### Sprint 5: Russell Circumplex Model ✅

4th model — Emotional Space. 28 reference emotions across 4 quadrants. Tap-to-place + nearest suggestions interaction.

- [x] `src/models/dimensional/types.ts` — DimensionalEmotion with valence, arousal, quadrant
- [x] `src/models/dimensional/data.json` — 28 emotions (7 per quadrant) with coordinates, descriptions, needs (bilingual)
- [x] `src/models/dimensional/index.ts` — model logic + `findNearest()` Euclidean distance helper
- [x] `src/components/DimensionalField.tsx` — SVG 2D field, axis labels, reference dots, crosshair, 3-nearest suggestions panel
- [x] Registered in `src/models/registry.ts`
- [x] `src/__tests__/dimensional-model.test.ts` — 11 tests (state, analyze, findNearest)
- [x] `src/__tests__/dimensional-data.test.ts` — 9 tests (data integrity, quadrant balance, coordinate ranges)
- [x] `src/__tests__/DimensionalField.test.tsx` — 4 tests (SVG render, axis labels, emotion labels, circles)

---

### Sprint 6: Data Enrichment (Deferred Emotions) ✅

Priority order: dor, compassion, loneliness, safety/relief, nostalgia, boredom (circumplex), contempt (circumplex).

- [x] Added 5 emotions to dimensional/data.json: dor, compassion, relief, nostalgia, contempt (28 → 33)
- [x] Added 7 emotions to plutchik/data.json (48 → 55): compassion, nostalgia, contempt + related dyads/spawns
- [x] Added 5 emotions to wheel/data.json (130 → 135): dor, compassion, loneliness, relief, nostalgia
- [x] Updated data integrity tests (dynamic counts, ≥ floor assertions)

---

### Sprint 7: Accessibility + PWA Polish ✅

- [x] ARIA for SVG body regions (role="button", aria-label, aria-pressed, tabindex, onKeyDown)
- [x] ARIA for DimensionalField emotion dots (role="button", tabindex, keyboard Enter/Space)
- [x] BubbleField uses native `<button>` elements — keyboard-accessible by default
- [x] ResultModal: role="dialog", aria-modal="true", aria-label
- [x] A11y test assertions added to BodyMap, DimensionalField, and ResultModal tests (3 new tests)
- [ ] PWA offline caching verification (deferred — requires manual device testing)

---

## Tech Debt Rules (enforced throughout)

1. No sprint ships without tests for the code it touches
2. Extract before duplicate -- if two components need the same UI, extract it first
3. Run full test suite + build before every commit
4. Maximum component size: 300 lines -- split if exceeded
5. No `as` type casts without a comment explaining why
6. Unused code removed immediately
