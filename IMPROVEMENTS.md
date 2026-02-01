# Improvements

## Body Map Fixes (Applied)

Issues identified from architect, planner, and psychologist review. All fixes applied in a single pass.

### Critical

| # | Issue | File(s) | Status |
|---|-------|---------|--------|
| 1 | Back region SVG paths entirely covered by front regions — unclickable in free mode | `body-paths.ts` | Done |
| 2 | Re-select toggle bug: clicking selected region calls `onSelect` instead of `onDeselect` | `BodyMap.tsx`, `types.ts`, `App.tsx` | Done |

### High

| # | Issue | File(s) | Status |
|---|-------|---------|--------|
| 3 | GuidedScan sensation buttons show raw English keys instead of translated labels | `GuidedScan.tsx` | Done |
| 4 | GuidedScan hardcodes intensity=2 with no user choice | `GuidedScan.tsx` | Done |
| 5 | Non-emotion IDs: "overthinking", "concentration", "grounding", "burden" | `data.json` | Done |
| 6 | Clinical terms that may pathologize: "dissociation", "suppression", "numbness-emotion" | `data.json` | Done |
| 7 | Scoring threshold too low (0.3); no cross-region coherence bonus | `scoring.ts` | Done |
| 8 | Match strength labels use "match" framing instead of exploratory language | `scoring.ts` | Done |

### Medium

| # | Issue | File(s) | Status |
|---|-------|---------|--------|
| 9 | Centering phase too short (3s) for meaningful grounding | `GuidedScan.tsx` | Done |
| 10 | GuidedScan shows only 4 sensations when regions have 4-6 | `GuidedScan.tsx` | Done |
| 11 | Scan order breaks spatial continuity (all front then all back) | `GuidedScan.tsx` | Done |
| 12 | Emotion descriptions lack adaptive-function framing | `data.json` | Done |
| 13 | Stomach description uses "second brain" pop-science language | `data.json` | Done |
| 14 | Romanian typo: "Maini amortitin" | `data.json` | Done |
| 15 | Intensity labels lack anchor descriptions for calibration | `SensationPicker.tsx` | Done |
| 16 | Unused i18n keys: `strongMatch`, `possibleMatch`, `worthConsidering` | `en.json`, `ro.json` | Done |

### Changes Detail

**SVG paths** (`body-paths.ts`): Widened upper-back (x: 63-137) and lower-back (x: 67-133) to peek ~15px beyond chest/stomach on each side.

**Deselect flow** (`types.ts`, `App.tsx`, `BodyMap.tsx`): Added `onDeselect?` to `VisualizationProps`, passed from App, used in BodyMap toggle-off with enriched `SomaticSelection`.

**GuidedScan** (`GuidedScan.tsx`): Imported `SENSATION_CONFIG` for i18n labels; 2-step sensation->intensity flow; 10s centering with breathing animation; shows all sensations; interleaved front/back scan order.

**Data quality** (`data.json`): Merged "overthinking" into anxiety; removed "concentration"; renamed grounding->calm, burden->overwhelm, suppression->emotional-holding, dissociation->disconnection (weight 0.7->0.4), numbness-emotion->emotional-withdrawal. Added adaptive-function sentences to all descriptions. Fixed Romanian typo and stomach pop-science.

**Scoring** (`scoring.ts`): Threshold 0.3->0.5; coherence bonus 1.2x for 2+ body groups; reframed labels to "resonance"/"connection"/"exploring".

**SensationPicker** (`SensationPicker.tsx`): Anchor descriptions on intensity labels.

---

## Future Improvements (Planned)

### 1. Emotional Profile Synthesis

Rule-based narrative interpretation of multi-emotion combinations. When a user selects multiple emotions, generate an adaptive message considering valence balance, intensity patterns, emotional complexity, and adaptive framing.

**Rationale:** Raw emotion labels alone don't help users understand what it means to feel a specific combination.

**Implementation notes:**
- Rule engine in `analyze()` output (no AI/LLM needed)
- Add `synthesis` field to `AnalysisResult`
- Display as a summary card in `ResultModal`

### 2. Russell's Circumplex Model

2D valence-arousal dimensional model. Emotions plotted on a scatter chart with valence (x) and arousal (y).

**Rationale:** Captures nuance that categorical models miss. Widely used in affective science research.

**Implementation notes:**
- Custom scatter-plot visualization component
- Users tap regions of 2D space to identify emotional state
- Could overlay labels from other models for cross-referencing

### 3. Somatic / Functional Entry Prompts

Body-first emotion identification flow based on Damasio's somatic marker hypothesis. Prompt users with body sensations and map to emotions.

**Rationale:** Many people can identify physical sensations more easily than emotion labels.

**Implementation notes:**
- Could serve as an entry point before other models
- Builds on the existing Body Map infrastructure
