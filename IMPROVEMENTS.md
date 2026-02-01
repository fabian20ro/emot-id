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

### Sprint 4: Emotional Profile Synthesis

Rule-based narrative for multi-emotion results. Transforms from labeling tool to reflection tool.

Rules: valence balance, intensity pattern, complexity framing, adaptive function weaving, needs integration.

- [ ] `src/models/synthesis.ts` -- `synthesize(results, language)` pure function returning 4-8 sentence narrative
- [ ] Update ResultModal to show synthesis card above individual results
- [ ] `src/__tests__/synthesis.test.ts` -- test each rule independently

---

### Sprint 5: Russell Circumplex Model

4th model -- adds dimensional/spatial access channel. 28 reference emotions across 4 quadrants. Tap-to-place + drag-to-refine interaction.

- [ ] `src/models/dimensional/types.ts` -- DimensionalEmotion with valence, arousal
- [ ] `src/models/dimensional/data.json` -- 28 emotions with coordinates, descriptions, needs
- [ ] `src/models/dimensional/index.ts` -- model logic (nearest emotion selection)
- [ ] `src/components/DimensionalField.tsx` -- 2D field visualization
- [ ] Register in `src/models/registry.ts`
- [ ] `src/__tests__/dimensional-model.test.ts`
- [ ] `src/__tests__/dimensional-data.test.ts`
- [ ] `src/__tests__/DimensionalField.test.tsx`

---

### Sprint 6: Data Enrichment (Deferred Emotions)

Priority order: dor, compassion, loneliness, safety/relief, nostalgia, boredom (circumplex), contempt (circumplex).

- [ ] Add new emotions across all model data.json files
- [ ] Update data integrity tests

---

### Sprint 7: Accessibility + PWA Polish

- [ ] ARIA for SVG regions (role="button", aria-label, tabindex)
- [ ] Keyboard nav for BubbleField (arrow keys + Enter)
- [ ] Keyboard nav for DimensionalField
- [ ] PWA offline caching verification
- [ ] Final a11y audit (screen reader, focus management in modals)

---

## Tech Debt Rules (enforced throughout)

1. No sprint ships without tests for the code it touches
2. Extract before duplicate -- if two components need the same UI, extract it first
3. Run full test suite + build before every commit
4. Maximum component size: 300 lines -- split if exceeded
5. No `as` type casts without a comment explaining why
6. Unused code removed immediately
