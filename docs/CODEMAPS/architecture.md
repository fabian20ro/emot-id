# Architecture Codemap

**Last Updated:** 2026-02-01
**Framework:** React 19 + TypeScript 5.9, Vite 7, Tailwind CSS 4
**Entry Point:** `src/main.tsx`

## High-Level Architecture

```
main.tsx
  |
  StrictMode > LanguageProvider > App
                                   |
                    +------+-------+-------+----------+
                    |      |       |       |          |
                  Header  AnalyzeButton  SelectionBar  Visualization*  ResultModal
                    |                      |
              SettingsMenu           combo display
              MenuButton
```

`*` Visualization is resolved at runtime from the model registry.

## Core Patterns

### Model Registry (`src/models/registry.ts`)

Maps each model ID to its `EmotionModel` implementation and a React visualization component.

```
registry: Record<string, { model: EmotionModel, Visualization: ComponentType }>
```

| Model ID   | Model Implementation | Visualization |
|------------|---------------------|---------------|
| `plutchik` | `plutchikModel`     | `BubbleField` |
| `wheel`    | `wheelModel`        | `BubbleField` |
| `somatic`  | `somaticModel`      | `BodyMap`      |

**Exports:** `getModel(id)`, `getVisualization(id)`, `getAvailableModels()`, `defaultModelId`

### State Management

No external state library. State lives in:

| Location | What | Persistence |
|----------|------|-------------|
| `App` component state | `modelId`, `isModalOpen`, `analysisResults` | `modelId` in localStorage |
| `useEmotionModel` hook | `selections`, `modelState` (visible IDs, generation) | none (resets on model change) |
| `LanguageContext` | `language` ('ro' or 'en') | localStorage |

### Data Flow: Select -> Analyze

```
User taps emotion
  -> App.handleSelect (plays sound)
    -> useEmotionModel.handleSelect
      -> model.onSelect(emotion, state, selections)
        <- returns SelectionEffect { newState, newSelections? }
      -> updates modelState + selections

User taps "Analyze"
  -> App.analyzeEmotions
    -> model.analyze(selections)
      <- returns AnalysisResult[]
    -> opens ResultModal with results
```

### Internationalization

- **UI strings:** `src/i18n/ro.json`, `src/i18n/en.json` accessed via `useLanguage().t`
- **Emotion labels:** Inline `{ ro: string; en: string }` on each emotion object
- **Default:** English (falls back from browser language detection)
- **Provider:** `LanguageContext` wraps entire app

## File Map

```
src/
  main.tsx                        # ReactDOM.createRoot, wraps App in LanguageProvider
  App.tsx                         # Root component, model switching, sound, modal
  index.css                       # Global Tailwind styles
  context/
    LanguageContext.tsx            # i18n provider + useLanguage hook
  hooks/
    useEmotionModel.ts            # Model state machine (selections, visibility, sizes)
    useSound.ts                   # Web Audio API tones (select/deselect)
  models/
    types.ts                      # BaseEmotion, EmotionModel, ModelState, AnalysisResult, VisualizationProps
    registry.ts                   # Model registry (model + visualization per ID)
    plutchik/                     # Plutchik wheel model
    wheel/                        # Emotion Wheel model
    somatic/                      # Body Map model
  components/
    Header.tsx                    # App header with menu trigger
    MenuButton.tsx                # Animated hamburger button
    SettingsMenu.tsx              # Language + model selector dropdown
    AnalyzeButton.tsx             # Gradient CTA button
    SelectionBar.tsx              # Selected emotions strip + combo display
    ResultModal.tsx               # Analysis results modal
    BubbleField.tsx               # Bubble-based visualization (Plutchik, Wheel)
    Bubble.tsx                    # Single animated emotion bubble
    BodyMap.tsx                   # SVG body silhouette visualization (Somatic)
    BodyRegion.tsx                # Single SVG body region path
    body-paths.ts                 # SVG path data for 14 body regions
    SensationPicker.tsx           # Sensation type + intensity popover
    GuidedScan.tsx                # Head-to-feet guided body scan overlay
  i18n/
    ro.json                       # Romanian UI strings
    en.json                       # English UI strings
  __tests__/                      # Vitest + Testing Library tests
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
