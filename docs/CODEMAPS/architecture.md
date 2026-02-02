# Architecture Codemap

**Last Updated:** 2026-02-02
**Framework:** React 19 + TypeScript 5.9, Vite 7, Tailwind CSS 4
**Entry Point:** `src/main.tsx`

## High-Level Architecture

```
main.tsx
  |
  StrictMode > LanguageProvider > App
                                   |
                    +------+-------+-------+----------+----------+
                    |      |       |       |          |          |
                  Header  AnalyzeButton  SelectionBar  Visualization*  ResultModal  DontKnowModal
                    |                      |               |
              SettingsMenu           combo display    CrisisBanner
              MenuButton
```

`*` Visualization is resolved at runtime from the model registry.

## Core Patterns

### Model Registry (`src/models/registry.ts`)

Maps each model ID to its `EmotionModel` implementation and a React visualization component.

```
registry: Record<ModelId, { model: EmotionModel, Visualization: ComponentType }>
```

| Model ID       | Model Implementation  | Visualization      |
|----------------|-----------------------|--------------------|
| `plutchik`     | `plutchikModel`       | `BubbleField`      |
| `wheel`        | `wheelModel`          | `BubbleField`      |
| `somatic`      | `somaticModel`        | `BodyMap`          |
| `dimensional`  | `dimensionalModel`    | `DimensionalField` |

**Constants:** `MODEL_IDS` in `src/models/constants.ts` maps string literals to type-safe `ModelId` union.

**Exports:** `getModel(id)`, `getVisualization(id)`, `getAvailableModels()`, `defaultModelId` (somatic)

### State Management

No external state library. State lives in:

| Location | What | Persistence |
|----------|------|-------------|
| `App` component state | `modelId`, `isModalOpen`, `analysisResults`, `showHint`, `showDontKnow` | `modelId` in localStorage, hint dismissed per model in localStorage |
| `useEmotionModel` hook | `selections`, `modelState` (visible IDs, generation) | none (resets on model change) |
| `LanguageContext` | `language` ('ro' or 'en') | localStorage |
| `useSound` | `muted` | localStorage (`emot-id-sound-muted`) |

### Data Flow: Select / Deselect -> Analyze

```
User taps emotion (or body region, or dimensional dot)
  -> App.handleSelect (dismisses hint, plays sound)
    -> useEmotionModel.handleSelect
      -> model.onSelect(emotion, state, selections)
        <- returns SelectionEffect { newState, newSelections? }
      -> updates modelState + selections

User taps selected emotion (deselect)
  -> App.handleDeselect (plays sound)
    -> useEmotionModel.handleDeselect
      -> model.onDeselect(emotion, state)
        <- returns SelectionEffect { newState }
      -> removes from selections, updates modelState

User taps "Analyze"
  -> App.analyzeEmotions
    -> model.analyze(selections)
      <- returns AnalysisResult[]
    -> opens ResultModal with results
      -> synthesize(results, language) generates narrative
      -> getCrisisTier(resultIds) determines safety response
```

**Somatic deselect routing:** BodyMap intercepts the deselect path. When a selected region is clicked, it calls `onDeselect(enrichedSelection)` with the `SomaticSelection` from its selection map, not `onSelect(plainRegion)`.

### Safety & Crisis Detection

`src/models/distress.ts` exports shared constants:
- **`HIGH_DISTRESS_IDS`**: Set of emotion IDs indicating high distress
- **`TIER3_COMBOS`**: Specific pairs triggering tier 3 (most severe) crisis response
- **`getCrisisTier(resultIds)`**: Returns `'none' | 'tier1' | 'tier2' | 'tier3'`

`src/models/synthesis.ts` generates narrative paragraphs:
- Detects valence profile (positive/negative/mixed), intensity profile (high/low)
- Severity-aware: 2+ distress results shift tone from adaptive-function to acknowledgment-first
- Weaves adaptive function descriptions, needs integration
- Bilingual (ro/en) template system

### Cross-Model Bridges (`src/components/model-bridges.ts`)

Pure function `getModelBridge()` suggests contextual next models after analysis:
- Plutchik/Wheel -> Somatic: "Where do you notice this in your body?"
- Somatic -> Wheel: "Can you name the emotion more precisely?"
- Dimensional -> Wheel: "Want to explore what this feeling is called?"

### Internationalization

- **UI strings:** `src/i18n/ro.json`, `src/i18n/en.json` accessed via `useLanguage().t`
- **Emotion labels:** Inline `{ ro: string; en: string }` on each emotion object
- **Default:** English (falls back from browser language detection)
- **Provider:** `LanguageContext` wraps entire app

## File Map

```
src/
  main.tsx                        # ReactDOM.createRoot, wraps App in LanguageProvider
  App.tsx                         # Root: model switching, sound, hint, onboarding, modals
  index.css                       # Global Tailwind styles
  context/
    LanguageContext.tsx            # i18n provider + useLanguage hook
  hooks/
    useEmotionModel.ts            # Model state machine (selections, visibility, sizes)
    useSound.ts                   # Web Audio API tones (select/deselect)
  models/
    types.ts                      # BaseEmotion, EmotionModel, ModelState, AnalysisResult, VisualizationProps
    constants.ts                  # MODEL_IDS constant + ModelId type
    registry.ts                   # Model registry (model + visualization per ID)
    distress.ts                   # Crisis tier detection (HIGH_DISTRESS_IDS, TIER3_COMBOS, getCrisisTier)
    synthesis.ts                  # Narrative synthesis (severity-aware bilingual templates)
    plutchik/                     # Plutchik wheel model
    wheel/                        # Emotion Wheel model
    somatic/                      # Body Map model
    dimensional/                  # Emotional Space model (2D valence x arousal)
  components/
    Header.tsx                    # App header with menu trigger
    MenuButton.tsx                # Animated hamburger button
    SettingsMenu.tsx              # Language + model selector dropdown
    AnalyzeButton.tsx             # Gradient CTA button
    SelectionBar.tsx              # Selected emotions strip + combo display
    ResultModal.tsx               # Analysis results modal (reflection flow, bridges, crisis)
    ResultCard.tsx                # Reusable result card (extracted from ResultModal)
    CrisisBanner.tsx              # Tiered crisis detection banner (safety-critical, extracted)
    model-bridges.ts              # Cross-model bridge suggestion logic (pure function)
    BubbleField.tsx               # Bubble-based visualization (Plutchik, Wheel)
    Bubble.tsx                    # Single animated emotion bubble
    BodyMap.tsx                   # SVG body silhouette visualization (Somatic)
    BodyRegion.tsx                # Single SVG body region path
    body-paths.ts                 # SVG path data for 12 body regions (seated pose)
    SensationPicker.tsx           # Sensation type + intensity popover
    IntensityPicker.tsx           # Intensity selection (1-3 scale, detailed/compact variants)
    GuidedScan.tsx                # Head-to-feet guided body scan overlay
    guided-scan-constants.ts      # Body groups, scan order, timing constants, pure utils
    DimensionalField.tsx          # 2D valence x arousal scatter plot (Dimensional)
    Onboarding.tsx                # 4-screen non-skippable onboarding overlay
    DontKnowModal.tsx             # "I don't know" modal (suggests Somatic or Dimensional)
    VisualizationErrorBoundary.tsx # Bilingual error boundary for visualizations
  i18n/
    ro.json                       # Romanian UI strings
    en.json                       # English UI strings
  __tests__/                      # Vitest + Testing Library tests (32 files, 232 tests)
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI framework |
| framer-motion | ^12.29.2 | Animations (spring physics, AnimatePresence, layout) |
| tailwindcss | ^4.1.18 | Utility-first CSS |
| vite | ^7.2.4 | Build tool + dev server |
| vite-plugin-pwa | ^1.2.0 | Service worker + manifest for PWA |
| vitest | ^4.0.18 | Test runner |

## Deployment

- PWA deployed to GitHub Pages at `/emot-id/`
- Build: `tsc -b && vite build`
- No backend, no database, no API calls (except Google Search link in ResultModal)

## Related Codemaps

- [Frontend Components](frontend.md) -- Component tree, visualizations, animations
- [Emotion Models](models.md) -- Model system, type hierarchy, scoring
