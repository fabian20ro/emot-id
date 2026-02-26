# Emotion Models Codemap

**Last Updated:** 2026-02-25
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
  shortName?: { ro; en }       // optional abbreviated name for narrow viewports
  description: { ro; en }
  allEmotions: Record<string, E>
  initialState: ModelState
  onSelect(emotion, state, selections): SelectionEffect
  onDeselect(emotion, state): SelectionEffect
  onClear(): ModelState
  analyze(selections): AnalysisResult[]
  getEmotionSize?(emotionId, state): 'small' | 'medium' | 'large'
}

ModelState { visibleEmotionIds: Map<string, number>, currentGeneration: number,
             custom?: Record<string, unknown> }
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

- **`HIGH_DISTRESS_IDS`**: Set of 17 emotion IDs (despair, rage, terror, grief, shame, loathing, worthless, helpless, apathetic, empty, powerless, abandoned, victimized, numb, violated, depressed, distressed)
- **`TIER3_COMBOS`**: 10 specific pairs triggering most severe crisis response
- **`TIER4_COMBOS`**: High-risk triples triggering emergency crisis response
- **`getCrisisTier(resultIds)`**: Returns `'none' | 'tier1' | 'tier2' | 'tier3' | 'tier4'`
  - tier1: 1 distress match (warm invitation)
  - tier2: 2+ matches (amber alert with grounding technique)
  - tier3: specific combos (direct acknowledgment)
  - tier4: high-risk triples (red emergency response + explicit acknowledgment gate)

### Temporal Crisis (`src/data/temporal-crisis.ts`)

- **`hasTemporalCrisisPattern(sessions)`**: 3+ tier2/3/4 sessions in last 7 days
- **`escalateCrisisTier(currentTier, sessions)`**: Bumps tier by 1 when pattern detected (caps at tier3 unless already tier4)
- Integrated into ResultModal: crisis tier is escalated before display when temporal pattern exists

### Narrative Synthesis (`src/models/synthesis.ts`)

- **`synthesize(results, language)`**: Generates narrative paragraph from analysis results
- Detects valence profile (positive/negative/mixed) from `result.valence`
- Detects intensity profile (high/low) from `result.arousal`
- Severity-aware: 2+ distress results shift from adaptive-function to acknowledgment tone
- Weaves: complexity framing, valence balance, intensity pattern, adaptive functions, needs
- Bilingual template system (ro/en)
- Combination-specific narratives for pleasant pairs (joy+gratitude, love+trust, etc.)

### Opposite Action (`src/data/opposite-action.ts`)

- **`getOppositeAction(emotionIds, language)`**: DBT-based opposite action suggestion
- Pattern matching: shame→approach, fear→gradual exposure, anger→avoidance+kindness, sadness→activation, guilt→repair, jealousy→gratitude, loneliness→reach out
- Returns bilingual string or null (no match for purely positive emotions)
- Displayed in ResultModal amber box within info panel
- Available during tier1-3 crisis (graduated access — DBT tools are designed for distress); only gated during tier4 pre-acknowledgment

## Model Implementations

### Plutchik (`src/models/plutchik/`)

**Concept:** 8 primary emotions that spawn related emotions and combine into dyads.

| Aspect | Detail |
|--------|--------|
| Initial state | 8 primaries visible: joy, trust, fear, surprise, sadness, disgust, anger, anticipation |
| Data | `data/` -- 6 JSON files split by category, merged in `index.ts` |
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
| Data | `data/` -- 11 JSON files (4 large roots split in halves + 3 smaller roots), merged in `index.ts` |
| Visualization | `BubbleField` |

**onSelect behavior:**
- Branch node (has children): replace visible set with children only, preserve existing selections
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
| Data | `data/` -- 5 JSON files split by body group, merged in `index.ts` |
| Visualization | `BodyMap` (not BubbleField) |
| Scoring | `scoring.ts` -- weighted signal matching |
| Emotions | 30+ candidate emotions (expanded from original 21) |

**Files:**
- `types.ts` -- `SomaticRegion`, `SomaticSelection`, `EmotionSignal`, `SensationType`, `BodyGroup`
- `index.ts` -- model implementation (merges 5 data files, delegates scoring)
- `scoring.ts` -- `scoreSomaticSelections()` algorithm
- `data/head.json` -- head, jaw, throat regions
- `data/torso-front.json` -- chest, stomach regions
- `data/torso-back.json` -- shoulders, upper-back, lower-back regions
- `data/arms.json` -- hands, arms regions
- `data/legs.json` -- legs, feet regions
- Emotion signals include `source`: `Nummenmaa2014`, `clinical`, or `interpolated`

**onSelect / onDeselect:** No-op on state (all regions always visible). BodyMap component enriches selections with `selectedSensation` and `selectedIntensity` before passing upstream.

**Sensation types (9):** tension, warmth, heaviness, lightness, tingling, numbness, churning, pressure, constriction

**Body groups (4):** head (5 regions), torso (5), arms (2), legs (2)

**Expanded emotions (added in C.1):** loneliness, tenderness, contempt, jealousy, frustration, relief, gratitude, hope, curiosity — each with somatic signatures based on Nummenmaa et al. (2014).

**Constriction sensation (added in C.2):** Distinct from tension (held muscular effort) and pressure (external force). Constriction = tightening/narrowing, common in throat, chest, stomach during anxiety/shame/grief.

**Adaptive descriptions:** Every `emotionDescription` includes an adaptive-function sentence.

**Numbness flooding detection:** When numbness reported across 3+ body groups, offers grounding prompt.

### Dimensional / Emotional Space (`src/models/dimensional/`)

**Concept:** 2D valence x arousal field. Place experience on pleasant/unpleasant and calm/intense axes.

| Aspect | Detail |
|--------|--------|
| Initial state | All emotions always visible (static scatter plot) |
| Data | `data.json` -- ~38 emotions with `valence` (-1..+1) and `arousal` (-1..+1) |
| Visualization | `DimensionalField` |
| Quadrants | pleasant-intense, pleasant-calm, unpleasant-intense, unpleasant-calm |

**onSelect / onDeselect:** No-op (all dots always visible). DimensionalField handles selection directly.

**Interaction:** Click field -> crosshair + 3 nearest emotions as suggestions. Click dot directly to toggle select.

**Coordinate nudges:** `lonely` and `resigned` coordinates were adjusted to reduce overlap in the unpleasant-calm quadrant (5 emotions added earlier to fill that gap).

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

## Data Layer (`src/data/`)

### Session Persistence

| Module | Purpose |
|--------|---------|
| `types.ts` | `Session`, `SerializedSelection`, `ChainAnalysisEntry` interfaces |
| `session-repo.ts` | IndexedDB CRUD via `idb-keyval` |
| `chain-analysis-repo.ts` | IndexedDB CRUD for DBT chain-analysis entries |
| `storage.ts` | localStorage facade for preferences |
| `reminders.ts` | Notification permission + once-per-day reminder cadence |

### Derived Analytics

| Module | Input | Output |
|--------|-------|--------|
| `vocabulary.ts` | `Session[]` | Active vs passive vocabulary counts, top identified emotions, milestones |
| `temporal-crisis.ts` | `Session[]` | 7-day crisis pattern detection + tier escalation |
| `somatic-patterns.ts` | `Session[]` | Body region frequency, sensation distribution |
| `valence-ratio.ts` | `Session[]` | Weekly pleasant/unpleasant/neutral counts |
| `opposite-action.ts` | `string[]` (emotion IDs) | DBT opposite action suggestion |
| `export.ts` | `Session[]` | Human-readable text export, clipboard copy, file download |

## Data Files

All data files use inline bilingual labels `{ ro, en }`. Large files are split into `data/` subdirectories and merged via spread imports in `index.ts` (no runtime cost — Vite inlines JSON at build time).

| Model | Files | Records | Shape |
|-------|-------|---------|-------|
| `plutchik/data/` | 6 files (primary, intensity, dyad, secondary-dyad, tertiary-dyad, opposite-dyad) | ~55 emotions | `PlutchikEmotion` |
| `wheel/data/` | 11 files (happy-1/2, angry-1/2, sad-1/2, fearful-1/2, surprised, bad, disgusted) | ~135 emotions | `WheelEmotion` |
| `somatic/data/` | 5 files (head, torso-front, torso-back, arms, legs) | 12 regions | `SomaticRegion` |
| `dimensional/data.json` | 1 file | ~38 emotions | `DimensionalEmotion` |

All split files are under 25KB (agent file-loading limit).

## Model Registry (`src/models/registry.ts`)

```typescript
visualizations: Record<ModelId, VisualizationComponent> // lazy components via React.lazy
modelCache: Partial<Record<ModelId, EmotionModel<BaseEmotion>>> // plutchik/wheel/dimensional eager, somatic lazy

// Exports
getModel(id: string): EmotionModel | undefined
loadModel(id: string): Promise<EmotionModel | undefined>
getVisualization(id: string): VisualizationComponent | undefined
getAvailableModels(): { id, name, shortName?, description }[]
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
