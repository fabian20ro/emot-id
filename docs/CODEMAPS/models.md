# Emotion Models Codemap

**Last Updated:** 2026-02-01
**Location:** `src/models/`

## Type Hierarchy

```
BaseEmotion { id, label, description?, color, intensity? }
  |
  +-- PlutchikEmotion  { category, intensity, opposite?, spawns[], components? }
  +-- WheelEmotion     { level, parent?, children? }
  +-- SomaticRegion    { svgRegionId, group, commonSensations[], emotionSignals[] }
       |
       +-- SomaticSelection  { selectedSensation, selectedIntensity }  (runtime enrichment)
```

## Core Interfaces (`src/models/types.ts`)

```typescript
EmotionModel<E extends BaseEmotion> {
  id: string
  name: string
  description: { ro; en }
  allEmotions: Record<string, E>
  initialState: ModelState
  onSelect(emotion, state, selections): SelectionEffect
  onDeselect(emotion, state): SelectionEffect
  onClear(): ModelState
  analyze(selections): AnalysisResult[]
  getEmotionSize(emotionId, state): 'small' | 'medium' | 'large'
}

ModelState { visibleEmotionIds: Map<string, number>, currentGeneration: number }
SelectionEffect { newState: ModelState, newSelections?: BaseEmotion[] }
AnalysisResult { id, label, color, description?, componentLabels?, hierarchyPath? }
VisualizationProps { emotions, onSelect, onDeselect?, sizes, selections? }
```

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

**Concept:** Identify emotions through physical body sensations in 14 regions.

| Aspect | Detail |
|--------|--------|
| Initial state | All 14 regions always visible |
| Data | `data.json` -- regions with `emotionSignals[]` mapping sensation+intensity to emotions |
| Visualization | `BodyMap` (not BubbleField) |
| Scoring | `scoring.ts` -- weighted signal matching |

**Files:**
- `types.ts` -- `SomaticRegion`, `SomaticSelection`, `EmotionSignal`, `SensationType`, `BodyGroup`
- `index.ts` -- model implementation (simple pass-through, delegates scoring)
- `scoring.ts` -- `scoreSomaticSelections()` algorithm
- `data.json` -- 14 body regions with sensation-to-emotion signal mappings

**onSelect / onDeselect:** No-op on state (all regions always visible). BodyMap component enriches selections with `selectedSensation` and `selectedIntensity` before passing upstream. Deselect routes through `onDeselect` with the enriched `SomaticSelection`.

**Sensation types (8):** tension, warmth, heaviness, lightness, tingling, numbness, churning, pressure

**Body groups (4):** head (5 regions), torso (5), arms (2), legs (2)

**Emotion ID conventions:** All emotion IDs are true emotional states (not cognitive processes or clinical terms). Key renames: overthinking→merged into anxiety, concentration→removed, grounding→calm, burden→overwhelm, suppression→emotional-holding, dissociation→disconnection, numbness-emotion→emotional-withdrawal.

**Adaptive descriptions:** Every `emotionDescription` includes an adaptive-function sentence explaining why the emotion exists (e.g., "Anger signals an important boundary that has been crossed").

### Scoring Algorithm (`src/models/somatic/scoring.ts`)

```
For each selection:
  For each emotionSignal on that region:
    if signal.sensationType matches selectedSensation
    AND selectedIntensity >= signal.minIntensity:
      contribution = signal.weight * selectedIntensity
      accumulate into emotionScores map (tracks contributing BodyGroups)

Apply coherence bonus: emotions matched from 2+ body groups get score * 1.2
Filter scores >= MINIMUM_THRESHOLD (0.5)
Sort descending, take top MAX_RESULTS (4)
Tag each with matchStrength: strong resonance (>=70%), possible connection (>=40%), worth exploring
```

**Output:** `ScoredEmotion extends AnalysisResult` with `score` and `matchStrength` fields. Uses `componentLabels` to carry contributing region labels.

**Coherence bonus rationale:** Emotions that manifest across multiple body areas (e.g., chest + legs) are more likely to be the dominant emotional state than single-region signals.

## Data Files

| File | Records | Shape |
|------|---------|-------|
| `plutchik/data.json` | ~30 emotions | `PlutchikEmotion` (id, label, color, category, spawns, components) |
| `wheel/data.json` | ~50 emotions | `WheelEmotion` (id, label, color, level, parent, children) |
| `somatic/data.json` | 14 regions | `SomaticRegion` (id, label, color, svgRegionId, group, commonSensations, emotionSignals[]) |

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
defaultModelId = 'plutchik'
```

Adding a new model requires:
1. Create `src/models/<id>/` with `types.ts`, `index.ts`, `data.json`
2. Implement `EmotionModel<YourEmotion>` interface
3. Register in `registry.ts` with a visualization component

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
