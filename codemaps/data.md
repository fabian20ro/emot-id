# Data Codemap

> Freshness: 2026-02-01

## Core Types (src/models/types.ts)

```
BaseEmotion
├── id: string
├── label: { ro: string, en: string }
├── color: string (hex)
└── intensity?: number

AnalysisResult
├── id: string
├── label: { ro: string, en: string }
├── color: string
├── description?: string
└── componentLabels?: { ro: string, en: string }[]

ModelState
├── visibleEmotionIds: Map<string, number>  // id → generation
└── currentGeneration: number

SelectionEffect
├── newState: ModelState
└── newSelections?: BaseEmotion[]  // undefined = default append

EmotionModel<E extends BaseEmotion>
├── id, name
├── allEmotions: Record<string, E>
├── initialState: ModelState
├── onSelect(emotion, state, selections): SelectionEffect
├── onDeselect(emotion, state): SelectionEffect
├── onClear(): ModelState
├── analyze(selections): AnalysisResult[]
└── getEmotionSize(emotionId, state): 'small'|'medium'|'large'
```

## Model-Specific Types

### Plutchik (src/models/plutchik/types.ts)

```
PlutchikEmotion extends BaseEmotion
├── category: 'primary'|'intensity'|'dyad'|'secondary_dyad'|'tertiary_dyad'|'opposite_dyad'
├── intensity: number (0.3–0.8)
├── opposite?: string (emotion id)
├── spawns: string[] (revealed on selection)
└── components?: string[] (two primary ids for dyads)
```

### Wheel (src/models/wheel/types.ts)

```
WheelEmotion extends BaseEmotion
├── level: number (0=root, 1=branch, 2=leaf)
├── parent?: string (parent emotion id)
└── children?: string[] (child emotion ids)
```

## Data Files

| File | Format | Count | Schema |
|------|--------|-------|--------|
| models/plutchik/data.json | Record<id, PlutchikEmotion> | 49 | Flat map with spawns/components links |
| models/wheel/data.json | Record<id, WheelEmotion> | ~70 | 3-level tree (parent/children links) |
| data/emotions.json | Legacy | 49 | Original Plutchik data (pre-refactor) |

## i18n Data (src/i18n/)

| File | Keys |
|------|------|
| ro.json | app, header, menu, selectionBar, analyze, modal |
| en.json | Same structure, English translations |

AI prompt templates use `{emotions}` placeholder for interpolation.

## Model Registry (src/models/registry.ts)

```
models: Record<string, EmotionModel>
├── 'plutchik' → plutchikModel (default)
└── 'wheel' → wheelModel

Exports: getModel(id), getAvailableModels(), defaultModelId
```

## Data Invariants

- Every emotion has `id`, `label.ro`, `label.en`, `color` (valid hex)
- Plutchik: spawns reference valid emotion ids, components have exactly 2 elements
- Wheel: parent/children form a valid tree, level matches depth
- All emotion colors are unique within their model
