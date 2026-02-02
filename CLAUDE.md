# Emot-ID

Interactive emotion identification PWA. Implements multiple emotion classification models: Plutchik's wheel, Emotion Wheel, Body Map of Emotions, and Emotional Space (2D valence/arousal).

## Tech Stack

- React 19 + TypeScript 5.9, Vite 7, Tailwind CSS 4, Framer Motion 12
- PWA via `vite-plugin-pwa`, deployed to GitHub Pages at `/emot-id/`
- Testing: Vitest + Testing Library + jsdom

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build` |
| `npm test` | `vitest run` |
| `npm run test:watch` | `vitest` (watch mode) |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/        # All UI components (flat)
│   ├── Bubble.tsx          # Single emotion bubble
│   ├── BubbleField.tsx     # Physics-like bubble layout (Plutchik, Wheel)
│   ├── BodyMap.tsx          # SVG body silhouette visualization (Somatic)
│   ├── BodyRegion.tsx       # Single SVG body region with heat coloring
│   ├── SensationPicker.tsx  # 2-step popover: sensation type → intensity
│   ├── GuidedScan.tsx       # Sequential head-to-feet body scan overlay
│   ├── guided-scan-constants.ts # Body groups, scan order, timing constants, pure utils
│   ├── body-paths.ts        # SVG path constants for 12 body regions (seated meditation pose)
│   ├── DimensionalField.tsx # 2D valence × arousal scatter plot (Dimensional)
│   ├── IntensityPicker.tsx  # Reusable intensity selection (1-3, detailed/compact)
│   ├── SelectionBar.tsx    # Selected emotions strip
│   ├── Header.tsx          # App header
│   ├── MenuButton.tsx      # Hamburger menu trigger
│   ├── SettingsMenu.tsx    # Settings panel (model selector, language, sound toggle)
│   ├── AnalyzeButton.tsx   # Triggers emotion analysis
│   ├── ResultModal.tsx     # Analysis result display (reflection flow, bridges, crisis)
│   ├── ResultCard.tsx       # Reusable result card (extracted from ResultModal)
│   ├── CrisisBanner.tsx     # Tiered crisis detection banner (extracted from ResultModal)
│   ├── model-bridges.ts     # Cross-model bridge suggestion logic (pure function)
│   ├── Onboarding.tsx       # 4-screen non-skippable onboarding overlay
│   ├── DontKnowModal.tsx    # "I don't know" modal (suggests Somatic or Dimensional)
│   └── VisualizationErrorBoundary.tsx  # Bilingual error boundary for visualizations
├── models/            # Emotion classification models
│   ├── types.ts            # BaseEmotion, EmotionModel, AnalysisResult interfaces
│   ├── constants.ts        # MODEL_IDS constant + ModelId type
│   ├── distress.ts         # Shared distress constants, crisis tier detection
│   ├── synthesis.ts        # Narrative synthesis (severity-aware templates)
│   ├── registry.ts         # Model registry (available models + visualizations)
│   ├── plutchik/           # Plutchik's wheel model
│   │   ├── index.ts        # Model implementation (spawns, dyads)
│   │   ├── types.ts        # PlutchikEmotion extends BaseEmotion
│   │   └── data.json       # Emotion data with descriptions
│   ├── wheel/              # Emotion Wheel model (hierarchical drill-down)
│   │   ├── index.ts        # Model implementation (tree navigation)
│   │   ├── types.ts        # WheelEmotion extends BaseEmotion
│   │   └── data.json       # Emotion data with descriptions
│   ├── somatic/            # Body Map of Emotions model
│   │   ├── index.ts        # Model implementation (region selection)
│   │   ├── types.ts        # SomaticRegion, SomaticSelection, SensationType
│   │   ├── scoring.ts      # Pattern → emotion scoring engine
│   │   └── data.json       # 12 body regions with emotion signal mappings
│   └── dimensional/        # Emotional Space model (2D valence × arousal)
│       ├── index.ts        # Model implementation (findNearest, pass-through state)
│       ├── types.ts        # DimensionalEmotion extends BaseEmotion
│       └── data.json       # ~35 emotions with valence, arousal, quadrant
├── context/
│   └── LanguageContext.tsx  # i18n provider (ro/en, persisted to localStorage)
├── hooks/
│   ├── useEmotionModel.ts  # Model state management (selection, analysis)
│   └── useSound.ts         # Web Audio API tones (select/deselect)
├── i18n/
│   ├── ro.json             # Romanian (default)
│   └── en.json             # English
├── __tests__/              # Vitest tests
├── App.tsx                 # Root component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Architecture

### Core Types (in `src/models/types.ts`)

```typescript
interface BaseEmotion {
  id: string
  label: { ro: string; en: string }
  description?: { ro: string; en: string }
  needs?: { ro: string; en: string }
  color: string
  intensity?: number
}

interface EmotionModel<E extends BaseEmotion> {
  id: string
  name: { ro: string; en: string }
  description: { ro: string; en: string }
  allEmotions: Record<string, E>
  initialState: ModelState
  onSelect(emotion, state, selections): SelectionEffect
  onDeselect(emotion, state): SelectionEffect
  onClear(): ModelState
  analyze(selections): AnalysisResult[]
  getEmotionSize?(emotionId, state): 'small' | 'medium' | 'large'  // optional, defaults to 'medium'
}
```

Each model extends `BaseEmotion` with model-specific fields (e.g. Plutchik adds `spawns`, `components`, `category`; Wheel adds `level`, `parent`, `children`; Somatic adds `emotionSignals`, `group`, `commonSensations`; Dimensional adds `valence`, `arousal`, `quadrant`).

### How It Works

- **Model Registry** maps model IDs to model logic + visualization component
- **BubbleField** renders emotion bubbles with physics-like positioning (Plutchik, Wheel)
- **BodyMap** renders an SVG body silhouette with 12 interactive regions (Somatic)
- **DimensionalField** renders a 2D valence×arousal scatter plot (Dimensional)
- Plutchik: selecting a bubble spawns related emotions; dyads detected from components
- Wheel: 3-level drill-down navigation; only leaf nodes become selections
- Somatic: tap region → pick sensation type + intensity → scoring engine maps patterns to emotions
- **SelectionBar** shows current picks; **AnalyzeButton** triggers result analysis
- State lives in component state + Context API. No router, no backend.
- Bilingual: English default, Romanian auto-detected from browser. Persisted to localStorage. Emotion labels are inline (`label.ro`/`label.en`), UI strings in `i18n/*.json`

### Somatic Model Pattern

The Body Map uses an **adapter pattern** where body regions extend `BaseEmotion`. The BodyMap component intercepts both `onSelect` and `onDeselect`:
- **Select:** enriches regions with sensation type + intensity (as `SomaticSelection`) before passing upstream
- **Deselect:** looks up the enriched `SomaticSelection` from the selection map and routes through `onDeselect`

The `analyze()` method downcasts back and runs a weighted scoring algorithm (threshold 0.5, scaled coherence bonus: 1.2x for 2 body groups, 1.3x for 3, 1.4x for 4+) mapping somatic patterns to candidate emotions. All emotion descriptions include adaptive-function framing ("why this emotion exists").

### Safety & Crisis Detection

`src/models/distress.ts` exports shared constants:
- **`HIGH_DISTRESS_IDS`**: Set of emotion IDs that indicate high distress (despair, grief, helpless, worthless, etc.)
- **`TIER3_COMBOS`**: Specific pairs that trigger tier 3 (most severe) crisis response
- **`getCrisisTier(resultIds)`**: Returns `'none' | 'tier1' | 'tier2' | 'tier3'`

Crisis tiers in ResultModal:
- **Tier 1** (1 distress match): warm invitation — "support is available"
- **Tier 2** (2+ matches): amber alert with 5-4-3-2-1 grounding technique
- **Tier 3** (specific combos): direct acknowledgment — "sounds very painful"

`synthesis.ts` is severity-aware: when 2+ distress results detected, shifts from adaptive-function tone to acknowledgment-first ("sounds painful" instead of "something meaningful").

### Cross-Model Bridges

ResultModal suggests contextual next models after analysis:
- Plutchik/Wheel → Somatic: "Where do you notice this in your body?"
- Somatic → Wheel: "Can you name the emotion more precisely?"
- Dimensional → Wheel/Plutchik: "Want to explore what this feeling is called?"

## Multi-Model Expansion Direction

### Models

| Model | Data Shape | Status |
|-------|-----------|--------|
| Plutchik wheel | Wheel with dyads + spawns | Done |
| Emotion Wheel | 3-tier tree (drill-down navigation) | Done |
| Body Map | SVG silhouette, 12 regions, sensation + intensity | Done |
| Emotional Space | 2D valence × arousal field | Done |
| Ekman facial | Flat list (6 basic emotions) | Planned |
| Parrott hierarchy | 3-tier tree (primary → secondary → tertiary) | Planned |
| Contrasting pairs/axes | 2D axes (valence × arousal) | Planned |
| Wheel of emotions image | Image-based interactive | Planned |
| Master combination | Aggregates all models | Future |

### Architecture Needs

- **Model-specific visualizations**: BubbleField (Plutchik, Wheel), BodyMap (Somatic), DimensionalField (Emotional Space); future models may need different visualizations (flat grid, image overlay)
- **Additional models**: Ekman, Parrott, contrasting pairs (see Models table above)

## Key Conventions

- Framer Motion for all animations (spring physics, `layout` prop)
- Dynamic inline styles for emotion `color` (not Tailwind classes)
- Functional state updates to avoid stale closures in callbacks
- Tests with Vitest + Testing Library (files in `src/__tests__/`)
- Dark theme only; no light mode currently
- React.memo on visualization components (Bubble, BodyRegion, BubbleField, BodyMap, DimensionalField)
- Sound mute state persisted to localStorage (`emot-id-sound-muted`)
- Onboarding disclaimer screen is non-skippable (skip button hidden on last screen)

## Adding a New Model

1. Create `src/models/<id>/` with `types.ts`, `index.ts`, `data.json`
2. Extend `BaseEmotion` with model-specific fields
3. Implement `EmotionModel<YourType>` interface
4. Add ID to `MODEL_IDS` in `src/models/constants.ts`
5. Register in `src/models/registry.ts` with a visualization component
6. Add model-specific i18n keys to `src/i18n/ro.json` and `src/i18n/en.json`
7. Add first-hint text to `firstHint.<modelId>` in both i18n files

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `emot-id-model` | Last selected model ID |
| `emot-id-sound-muted` | Sound mute preference |
| `emot-id-onboarded` | Onboarding completed flag |
| `emot-id-hint-<modelId>` | First interaction hint dismissed per model |
| `emot-id-language` | UI language (`ro` or `en`) |

## Data Quality Notes

- Plutchik dyads: `nostalgia` uses `[serenity, sadness]` (not `[joy, sadness]`) to differentiate from `bittersweetness`
- Plutchik: `compassion` uses `[trust, sadness]` (not `[love, sadness]`) to be reachable from primary emotions
- Plutchik: `ruthlessness` replaced `aggressiveness` (was duplicate of `aggression`)
- Wheel: `overwhelmed` replaced `busy` (busy is not an emotion)
- Dimensional: 5 emotions added to fill unpleasant-calm quadrant gap (apathetic, melancholic, resigned, pensive, contemplative)
