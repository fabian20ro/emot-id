# Architecture Codemap

**Last Updated:** 2026-02-06
**Framework:** React 19 + TypeScript 5.9, Vite 7, Tailwind CSS 4
**Entry Point:** `src/main.tsx`

## High-Level Architecture

```
main.tsx
  |
  StrictMode > LanguageProvider > App
                                   |
                    +------+-------+-------+----------+----------+----------+
                    |      |       |       |          |          |          |
                  Header  SettingsMenu*  AnalyzeButton  SelectionBar  Visualization**  ResultModal  DontKnowModal
                  |  |       |                |               |               |
          MenuButton ModelBar InfoButton[]  combo display  CrisisBanner    MicroIntervention
                             SessionHistory               OppositeAction
```

`*` SettingsMenu renders via `createPortal(…, document.body)` — a sibling of the main layout div, not a child of Header.

`**` Visualization is resolved at runtime from the model registry.

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
| `useModelSelection` hook | Active `modelId` | localStorage via `storage.ts` |
| `useEmotionModel` hook | `selections`, `modelState` (visible IDs, generation) | none (resets on model change) |
| `useHintState` hook | Per-model `showHint` flag | localStorage via `storage.ts` |
| `useSessionHistory` hook | `sessions` array, CRUD operations | IndexedDB via `idb-keyval` |
| `LanguageContext` | `language` ('ro' or 'en'), `section()` accessor | localStorage via `storage.ts` |
| `useSound` | `muted` | localStorage via `storage.ts` |

### Storage Architecture

**Preferences** — `src/data/storage.ts` (localStorage facade):
- Consolidated wrapper for all preference keys (`emot-id-model`, `emot-id-language`, etc.)
- Graceful fallback when localStorage unavailable (private browsing)
- Per-model hint dismissal flags

**Sessions** — `src/data/session-repo.ts` (IndexedDB via `idb-keyval`):
- `saveSession`, `getAllSessions`, `deleteSession`, `clearAllSessions`, `exportSessionsJSON`
- Session data model in `src/data/types.ts`: `Session`, `SerializedSelection`

### Data Flow: Select / Deselect -> Analyze -> Save

```
User taps emotion (or body region, or dimensional dot)
  -> App.handleSelect (dismisses hint, plays sound)
    -> useEmotionModel.handleSelect
      -> model.onSelect(emotion, state, selections)
        <- returns SelectionEffect { newState, newSelections? }
      -> updates modelState + selections

User taps "Analyze"
  -> App.analyzeEmotions
    -> model.analyze(selections)
      <- returns AnalysisResult[]
    -> opens ResultModal with results
      -> synthesize(results, language) generates narrative
      -> getCrisisTier(resultIds) determines safety response
      -> escalateCrisisTier if temporal pattern detected
      -> getOppositeAction for DBT nudges
      -> getInterventionType for micro-intervention

User completes reflection (ResultModal close)
  -> App.handleSessionComplete(reflectionAnswer)
    -> serializes selections + results into Session
    -> useSessionHistory.save (writes to IndexedDB)
```

**Somatic deselect routing:** BodyMap intercepts the deselect path. When a selected region is clicked, it calls `onDeselect(enrichedSelection)` with the `SomaticSelection` from its selection map, not `onSelect(plainRegion)`.

### Safety & Crisis Detection

**Single-session** — `src/models/distress.ts`:
- **`HIGH_DISTRESS_IDS`**: Set of emotion IDs indicating high distress
- **`TIER3_COMBOS`**: Specific pairs triggering tier 3 (most severe) crisis response
- **`getCrisisTier(resultIds)`**: Returns `'none' | 'tier1' | 'tier2' | 'tier3'`

**Temporal pattern** — `src/data/temporal-crisis.ts`:
- **`hasTemporalCrisisPattern(sessions)`**: 3+ tier2/3 sessions in 7-day window
- **`escalateCrisisTier(currentTier, sessions)`**: Escalates by one level when pattern detected

**Narrative synthesis** — `src/models/synthesis.ts`:
- Detects valence profile (positive/negative/mixed), intensity profile (high/low)
- Severity-aware: 2+ distress results shift tone from adaptive-function to acknowledgment-first
- Bilingual (ro/en) template system

### Post-Identification Features

**Micro-interventions** — `src/components/MicroIntervention.tsx`:
- `breathing` (4-2-6 guided cycle, 3 rounds) for high-arousal results
- `savoring` (4-step mindful moment) for pleasant emotions
- `curiosity` (reflective prompt) for mixed valence
- Triggered from ResultModal via `getInterventionType()`

**Opposite action** — `src/data/opposite-action.ts`:
- DBT-based suggestions: shame→approach, fear→gradual exposure, anger→gentle avoidance
- Bilingual (ro/en), matched by emotion ID patterns
- Displayed in amber box between results and bridge in ResultModal

### Portal Pattern for Fixed Overlays

All `position: fixed` overlays render via `createPortal(…, document.body)` to escape parent stacking contexts (e.g. WebKit's `backdrop-filter` on `<header>` creates a new stacking context):

- **SettingsMenu** — bottom sheet drawer, portal to body, `z-[var(--z-modal)]`
- **InfoButton** — info dialog, portal to body, `z-[9999]`
- **SensationPicker** — uses `fixed` positioning inside BodyMap (works because BodyMap has no stacking context triggers)

The dialog pattern uses `useFocusTrap` for accessibility, Framer Motion `AnimatePresence` for enter/exit, and backdrop dismiss.

### Cross-Model Bridges (`src/components/model-bridges.ts`)

Pure function `getModelBridge()` suggests contextual next models after analysis:
- Plutchik/Wheel -> Somatic: "Where do you notice this in your body?"
- Somatic -> Wheel: "Can you name the emotion more precisely?"
- Dimensional -> Wheel: "Want to explore what this feeling is called?"
- Pleasant emotion bridges: "Where do you feel that warmth?" (savoring)

### Type-Safe i18n

- **UI strings:** `src/i18n/ro.json`, `src/i18n/en.json`
- **Accessor:** `useLanguage().section('sectionName')` returns typed section object
- **Emotion labels:** Inline `{ ro: string; en: string }` on each emotion object
- **Default:** English (falls back from browser language detection)
- **Provider:** `LanguageContext` wraps entire app

## File Map

```
src/
  main.tsx                        # ReactDOM.createRoot, wraps App in LanguageProvider
  App.tsx                         # Root: model switching, sound, hint, onboarding, modals, session saving
  index.css                       # Global Tailwind, z-index scale, layout CSS custom properties
  context/
    LanguageContext.tsx            # i18n provider + useLanguage hook (section() accessor)
  hooks/
    useModelSelection.ts          # Model ID persistence (localStorage via storage.ts)
    useHintState.ts               # Per-model hint dismissal (localStorage via storage.ts)
    useEmotionModel.ts            # Model state machine (selections, visibility, sizes)
    useSessionHistory.ts          # Session CRUD (IndexedDB via idb-keyval)
    useSound.ts                   # Web Audio API tones (select/deselect)
    useFocusTrap.ts               # Focus trapping for modals (Escape + Tab)
  data/
    storage.ts                    # localStorage facade (preferences, hint flags)
    types.ts                      # Session, SerializedSelection interfaces
    session-repo.ts               # IndexedDB CRUD via idb-keyval
    vocabulary.ts                 # Emotion vocabulary tracking + milestones
    temporal-crisis.ts            # 7-day rolling crisis pattern detection
    somatic-patterns.ts           # Body region + sensation frequency analysis
    valence-ratio.ts              # Weekly pleasant/unpleasant ratio
    opposite-action.ts            # DBT opposite action suggestions (bilingual)
    export.ts                     # Session export (text, clipboard, download)
  e2e/
    smoke.spec.ts                 # Playwright E2E smoke tests (mobile Safari + Chrome)
  models/
    types.ts                      # BaseEmotion, EmotionModel, ModelState, AnalysisResult
    constants.ts                  # MODEL_IDS constant + ModelId type
    registry.ts                   # Model registry (model + visualization per ID)
    distress.ts                   # Crisis tier detection (HIGH_DISTRESS_IDS, getCrisisTier)
    synthesis.ts                  # Narrative synthesis (severity-aware bilingual templates)
    plutchik/                     # Plutchik wheel model
    wheel/                        # Emotion Wheel model
    somatic/                      # Body Map model (30+ emotions, 9 sensation types)
    dimensional/                  # Emotional Space model (2D valence x arousal)
  components/
    Header.tsx                    # 48px merged header: MenuButton + ModelBar (inline)
    MenuButton.tsx                # Animated hamburger button
    SettingsMenu.tsx              # Bottom sheet drawer (portal to body): language, model, sound, history, privacy, disclaimer
    ModelBar.tsx                  # Model tab bar (inline in Header, or standalone)
    AnalyzeButton.tsx             # Gradient CTA with selection count
    SelectionBar.tsx              # Horizontal scroll strip: selected emotion chips + combo badges + undo
    UndoToast.tsx                 # 5-second undo toast for clear actions
    ResultModal.tsx               # Analysis results (reflection, bridges, crisis, interventions)
    ResultCard.tsx                # Reusable result card (InfoButton for collapsed descriptions)
    InfoButton.tsx                # Reusable info modal (portal to body, z-[9999], focus trap)
    CrisisBanner.tsx              # Tiered crisis detection banner (safety-critical)
    MicroIntervention.tsx         # Post-analysis breathing/savoring/curiosity exercises
    SessionHistory.tsx            # Session history modal (vocabulary, patterns, export)
    model-bridges.ts              # Cross-model bridge suggestion logic (pure function)
    BubbleField.tsx               # Bubble-based visualization (Plutchik, Wheel)
    Bubble.tsx                    # Single animated emotion bubble
    BodyMap.tsx                   # SVG body silhouette visualization (Somatic)
    BodyRegion.tsx                # Single SVG body region path
    body-paths.ts                 # SVG path data for 12 body regions (standing pose, 300x450 viewBox)
    SensationPicker.tsx           # Sensation type + intensity popover
    IntensityPicker.tsx           # Intensity selection (1-3 scale, detailed/compact)
    GuidedScan.tsx                # Head-to-feet guided body scan overlay
    guided-scan-constants.ts      # Body groups, scan order, timing constants
    DimensionalField.tsx          # 2D valence x arousal scatter plot (Dimensional)
    Onboarding.tsx                # 4-screen non-skippable onboarding overlay
    DontKnowModal.tsx             # "I don't know" modal (suggests Somatic or Dimensional)
    VisualizationErrorBoundary.tsx # Bilingual error boundary for visualizations
  i18n/
    ro.json                       # Romanian UI strings
    en.json                       # English UI strings
  __tests__/                      # Vitest + Testing Library tests (40+ files, ~290 tests)
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI framework |
| framer-motion | ^12.29.2 | Animations (spring physics, AnimatePresence, layout) |
| tailwindcss | ^4.1.18 | Utility-first CSS |
| idb-keyval | ^6.2.2 | IndexedDB key-value storage for sessions |
| vite | ^7.2.4 | Build tool + dev server |
| vite-plugin-pwa | ^1.2.0 | Service worker + manifest for PWA |
| vitest | ^4.0.18 | Test runner |

## Deployment

- PWA deployed to GitHub Pages at `/emot-id/`
- Build: `tsc -b && vite build`
- No backend, no database server, no API calls (client-side IndexedDB only)

## Related Codemaps

- [Frontend Components](frontend.md) -- Component tree, visualizations, animations
- [Emotion Models](models.md) -- Model system, type hierarchy, scoring
