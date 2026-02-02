# Emotion Models Codemap

**Last Updated:** 2026-02-02
**Location:** `src/models/`

## Type Hierarchy

```
BaseEmotion { id, label, description?, needs?, color, intensity? }
  |
  +-- PlutchikEmotion  { category, intensity, opposite?, spawns[], components? }
  +-- WheelEmotion     { level, parent?, children? }
  +-- SomaticRegion    { svgRegionId, group, commonSensations[], emotionSignals[] }
  |    |
  |    +-- SomaticSelection  { selectedSensation, selectedIntensity }  (runtime enrichment)
  +-- DimensionalEmotion  { valence, arousal, quadrant }
```

## Core Interfaces (`src/models/types.ts`)

```typescript
EmotionModel<E extends BaseEmotion> {
  id: string
  name: { ro; en }
  description: { ro; en }
  allEmotions: Record<string, E>
  initialState: ModelState
  onSelect(emotion, state, selections): SelectionEffect
  onDeselect(emotion, state): SelectionEffect
  onClear(): ModelState
  analyze(selections): AnalysisResult[]
  getEmotionSize?(emotionId, state): 'small' | 'medium' | 'large'
}

ModelState { visibleEmotionIds: Map<string, number>, currentGeneration: number }
SelectionEffect { newState: ModelState, newSelections?: BaseEmotion[] }
AnalysisResult { id, label, color, description?, needs?, componentLabels?, hierarchyPath?,
                 matchStrength?, valence?, arousal? }
VisualizationProps { emotions, onSelect, onDeselect?, sizes, selections? }
```

## Shared Modules

### Constants (`src/models/constants.ts`)

```typescript
MODEL_IDS = { PLUTCHIK: 'plutchik', WHEEL: 'wheel', SOMATIC: 'somatic', DIMENSIONAL: 'dimensional' }
type ModelId = 'plutchik' | 'wheel' | 'somatic' | 'dimensional'
```

### Distress Detection (`src/models/distress.ts`)

- **`HIGH_DISTRESS_IDS`**: Set of ~14 emotion IDs (despair, grief, helpless, worthless, etc.)
- **`TIER3_COMBOS`**: 10 specific pairs triggering most severe crisis response
- **`getCrisisTier(resultIds)`**: Returns `'none' | 'tier1' | 'tier2' | 'tier3'`
  - tier1: 1 distress match (warm invitation)
  - tier2: 2+ matches (amber alert with grounding technique)
  - tier3: specific combos (direct acknowledgment)

### Narrative Synthesis (`src/models/synthesis.ts`)

- **`synthesize(results, language)`**: Generates narrative paragraph from analysis results
- Detects valence profile (positive/negative/mixed) from `result.valence`
- Detects intensity profile (high/low) from `result.arousal`
- Severity-aware: 2+ distress results shift from adaptive-function to acknowledgment tone
- Weaves: complexity framing, valence balance, intensity pattern, adaptive functions, needs
- Bilingual template system (ro/en)

## Model Implementations

### Plutchik (`src/models/plutchik/`)

**Concept:** 8 primary emotions that spawn related emotions and combine into dyads.

| Aspect | Detail |
|--------|--------|
| Initial state | 8 primaries visible: joy, trust, fear, surprise, sadness, disgust, anger, anticipation |
| Data | `data.json` -- flat map of ~30 emotions with spawns and components |
| Visualization | `BubbleField` |

**onSelect behavior:**
- Remove selected emotion from visible set
- Add its `spawns[]` to visible set (new generation)
- Default hook behavior adds emotion to selections

**onDeselect behavior:**
- If emotion has `components` (is a dyad): restore component primaries to visible set
- Otherwise: restore the emotion itself to visible set

**analyze logic:**
- Single selection: return as-is
- Multiple: scan all emotions for `components[c1, c2]` where both are selected
- Matched dyads bubble up; unmatched selections listed individually
- `usedAsComponent` set prevents double-listing

**getEmotionSize:** `large` if same generation as current, `small` otherwise.

### Wheel (`src/models/wheel/`)

**Concept:** 3-level hierarchical tree. Drill down from general to specific emotions.

| Aspect | Detail |
|--------|--------|
| Initial state | 7 root emotions: happy, surprised, bad, fearful, angry, disgusted, sad |
| Data | `data.json` -- tree structure with `parent`/`children` links, `level` 0-2 |
| Visualization | `BubbleField` |

**onSelect behavior:**
- Branch node (has children): replace visible set with children only, preserve existing selections (does not add branch to selections)
- Leaf node: add to selections, reset visible set to root

**onDeselect behavior:**
- Always resets visible set to root level

**analyze logic:**
- Maps each selection to an `AnalysisResult` with `hierarchyPath` (walks `parent` chain to root, reverses)
- No combination detection

**getEmotionSize:** `large` for level 0, `medium` for level 1, `small` for level 2.

### Somatic / Body Map (`src/models/somatic/`)

**Concept:** Identify emotions through physical body sensations in 12 regions.

| Aspect | Detail |
|--------|--------|
| Initial state | All regions always visible |
| Data | `data.json` -- regions with `emotionSignals[]` mapping sensation+intensity to emotions |
| Visualization | `BodyMap` (not BubbleField) |
| Scoring | `scoring.ts` -- weighted signal matching |

**Files:**
- `types.ts` -- `SomaticRegion`, `SomaticSelection`, `EmotionSignal`, `SensationType`, `BodyGroup`
- `index.ts` -- model implementation (simple pass-through, delegates scoring)
- `scoring.ts` -- `scoreSomaticSelections()` algorithm
- `data.json` -- body regions with sensation-to-emotion signal mappings

**onSelect / onDeselect:** No-op on state (all regions always visible). BodyMap component enriches selections with `selectedSensation` and `selectedIntensity` before passing upstream.

**Sensation types (8):** tension, warmth, heaviness, lightness, tingling, numbness, churning, pressure

**Body groups (4):** head (5 regions), torso (5), arms (2), legs (2)

**Adaptive descriptions:** Every `emotionDescription` includes an adaptive-function sentence.

### Dimensional / Emotional Space (`src/models/dimensional/`)

**Concept:** 2D valence x arousal field. Place experience on pleasant/unpleasant and calm/intense axes.

| Aspect | Detail |
|--------|--------|
| Initial state | All emotions always visible (static scatter plot) |
| Data | `data.json` -- emotions with `valence` (-1..+1) and `arousal` (-1..+1) |
| Visualization | `DimensionalField` |
| Quadrants | pleasant-intense, pleasant-calm, unpleasant-intense, unpleasant-calm |

**onSelect / onDeselect:** No-op (all dots always visible). DimensionalField handles selection directly.

**Interaction:** Click field -> crosshair + 3 nearest emotions as suggestions. Click dot directly to toggle select.

**`findNearest(valence, arousal, emotions, count)`**: Euclidean distance sort, returns closest N emotions.

**analyze logic:** Maps selections to `AnalysisResult` with `valence` and `arousal` fields preserved.

**getEmotionSize:** Always returns `'small'` (unused -- DimensionalField doesn't use BubbleField).

### Scoring Algorithm (`src/models/somatic/scoring.ts`)

```
For each selection:
  For each emotionSignal on that region:
    if signal.sensationType matches selectedSensation
    AND selectedIntensity >= signal.minIntensity:
      contribution = signal.weight * selectedIntensity
      accumulate into emotionScores map (tracks contributing BodyGroups)

Apply coherence bonus (scaled):
  2 body groups: score * 1.2
  3 body groups: score * 1.3
  4+ body groups: score * 1.4
Filter scores >= MINIMUM_THRESHOLD (0.5)
Sort descending, take top MAX_RESULTS (4)
Tag with matchStrength: strong resonance (>=70%), possible connection (>=40%), worth exploring
```

**Output:** `ScoredEmotion extends AnalysisResult` with `score` and `matchStrength` fields.

## Data Files

| File | Records | Shape |
|------|---------|-------|
| `plutchik/data.json` | ~30 emotions | `PlutchikEmotion` (id, label, color, category, spawns, components) |
| `wheel/data.json` | ~50 emotions | `WheelEmotion` (id, label, color, level, parent, children) |
| `somatic/data.json` | 12 regions | `SomaticRegion` (id, label, color, svgRegionId, group, commonSensations, emotionSignals[]) |
| `dimensional/data.json` | ~35 emotions | `DimensionalEmotion` (id, label, color, valence, arousal, quadrant) |

All data files use inline bilingual labels `{ ro, en }`.

## Model Registry (`src/models/registry.ts`)

```typescript
interface ModelRegistryEntry {
  model: EmotionModel<BaseEmotion>
  Visualization: ComponentType<VisualizationProps>
}

// Exports
getModel(id: string): EmotionModel | undefined
getVisualization(id: string): ComponentType | undefined
getAvailableModels(): { id, name, description }[]
defaultModelId = 'somatic'
```

Adding a new model requires:
1. Create `src/models/<id>/` with `types.ts`, `index.ts`, `data.json`
2. Implement `EmotionModel<YourEmotion>` interface
3. Add to `MODEL_IDS` in `constants.ts`
4. Register in `registry.ts` with a visualization component

## Planned Models

| Model | Data Shape | Visualization |
|-------|-----------|---------------|
| Ekman facial | Flat list (6 basic) | BubbleField or new grid |
| Parrott hierarchy | 3-tier tree | BubbleField |
| Contrasting pairs | 2D axes (valence x arousal) | New scatter/axis viz |
| Image-based wheel | Image overlay | New image viz |
| Master combination | Aggregates all models | TBD |

## Related Codemaps

- [Architecture](architecture.md) -- Registry wiring, state management, data flow
- [Frontend](frontend.md) -- Visualization components that render model data
