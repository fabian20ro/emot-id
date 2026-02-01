# Emot-ID

Interactive emotion identification PWA. Implements multiple emotion classification models: Plutchik's wheel, Emotion Wheel, and Body Map of Emotions.

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
│   ├── body-paths.ts        # SVG path constants for 14 body regions
│   ├── SelectionBar.tsx    # Selected emotions strip
│   ├── Header.tsx          # App header
│   ├── MenuButton.tsx      # Hamburger menu trigger
│   ├── SettingsMenu.tsx    # Settings panel (model selector, language)
│   ├── AnalyzeButton.tsx   # Triggers emotion analysis
│   └── ResultModal.tsx     # Analysis result display
├── models/            # Emotion classification models
│   ├── types.ts            # BaseEmotion, EmotionModel, AnalysisResult interfaces
│   ├── registry.ts         # Model registry (available models + visualizations)
│   ├── plutchik/           # Plutchik's wheel model
│   │   ├── index.ts        # Model implementation (spawns, dyads)
│   │   ├── types.ts        # PlutchikEmotion extends BaseEmotion
│   │   └── data.json       # Emotion data with descriptions
│   ├── wheel/              # Emotion Wheel model (hierarchical drill-down)
│   │   ├── index.ts        # Model implementation (tree navigation)
│   │   ├── types.ts        # WheelEmotion extends BaseEmotion
│   │   └── data.json       # Emotion data with descriptions
│   └── somatic/            # Body Map of Emotions model
│       ├── index.ts        # Model implementation (region selection)
│       ├── types.ts        # SomaticRegion, SomaticSelection, SensationType
│       ├── scoring.ts      # Pattern → emotion scoring engine
│       └── data.json       # 14 body regions with emotion signal mappings
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
  color: string
  intensity?: number
}

interface EmotionModel<E extends BaseEmotion> {
  id: string
  name: string
  allEmotions: Record<string, E>
  initialState: ModelState
  onSelect(emotion, state, selections): SelectionEffect
  onDeselect(emotion, state): SelectionEffect
  onClear(): ModelState
  analyze(selections): AnalysisResult[]
  getEmotionSize(emotionId, state): 'small' | 'medium' | 'large'
}
```

Each model extends `BaseEmotion` with model-specific fields (e.g. Plutchik adds `spawns`, `components`, `category`; Wheel adds `level`, `parent`, `children`; Somatic adds `emotionSignals`, `group`, `commonSensations`).

### How It Works

- **Model Registry** maps model IDs to model logic + visualization component
- **BubbleField** renders emotion bubbles with physics-like positioning (Plutchik, Wheel)
- **BodyMap** renders an SVG body silhouette with 14 interactive regions (Somatic)
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

The `analyze()` method downcasts back and runs a weighted scoring algorithm (threshold 0.5, coherence bonus 1.2x for 2+ body groups) mapping somatic patterns to candidate emotions. All emotion descriptions include adaptive-function framing ("why this emotion exists").

## Multi-Model Expansion Direction

### Models

| Model | Data Shape | Status |
|-------|-----------|--------|
| Plutchik wheel | Wheel with dyads + spawns | Done |
| Emotion Wheel | 3-tier tree (drill-down navigation) | Done |
| Body Map | SVG silhouette, 14 regions, sensation + intensity | Done |
| Ekman facial | Flat list (6 basic emotions) | Planned |
| Parrott hierarchy | 3-tier tree (primary → secondary → tertiary) | Planned |
| Contrasting pairs/axes | 2D axes (valence × arousal) | Planned |
| Wheel of emotions image | Image-based interactive | Planned |
| Master combination | Aggregates all models | Future |

### Architecture Needs

- **Model-specific visualizations**: BubbleField (Plutchik, Wheel), BodyMap (Somatic); future models may need different visualizations (flat grid, 2D scatter, image overlay)
- **Additional models**: Ekman, Parrott, contrasting pairs (see Models table above)

## Key Conventions

- Framer Motion for all animations (spring physics, `layout` prop)
- Dynamic inline styles for emotion `color` (not Tailwind classes)
- Functional state updates to avoid stale closures in callbacks
- Tests with Vitest + Testing Library (files in `src/__tests__/`)
- Dark theme only; no light mode currently
