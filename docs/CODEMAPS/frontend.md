# Frontend Codemap

**Last Updated:** 2026-02-01
**Framework:** React 19 (App Router-less SPA), Framer Motion 12, Tailwind CSS 4

## Component Tree

```
App (src/App.tsx)
 +-- Header
 |    +-- MenuButton              # Animated hamburger (3 bars -> X)
 |    +-- SettingsMenu            # Dropdown: language toggle + model selector
 +-- AnalyzeButton                # Gradient CTA, disabled when no selections
 +-- SelectionBar                 # Horizontal strip of selected emotion chips + combo badges
 +-- Visualization*               # Resolved from registry per model ID
 |    +-- BubbleField             # For plutchik, wheel
 |    |    +-- Bubble[]           # Animated pill buttons with emotion color
 |    +-- BodyMap                 # For somatic
 |         +-- BodyRegion[]       # SVG path elements (14 regions)
 |         +-- SensationPicker    # 2-step popover (sensation -> intensity)
 |         +-- GuidedScan         # Sequential body scan overlay
 +-- ResultModal                  # Full-screen modal with analysis results
```

`*` Visualization component is dynamic: `getVisualization(modelId)` from registry.

## Visualization System

### BubbleField (`src/components/BubbleField.tsx`)

Used by: Plutchik, Wheel models.

- Renders emotion `Bubble` components with absolute positioning
- Uses `ResizeObserver` to track container dimensions
- Placement: random with collision detection (100 attempts), grid fallback
- Positions are memoized: existing bubbles keep position, only new ones are placed
- `AnimatePresence mode="popLayout"` for enter/exit animations

**Props:** `VisualizationProps { emotions, onSelect, sizes, selections? }`

### Bubble (`src/components/Bubble.tsx`)

- Framer Motion `motion.button` with spring enter/exit
- Sizes: `small` / `medium` / `large` mapped to Tailwind padding classes
- Color: inline `linear-gradient` from `emotion.color`, auto text contrast
- Helper functions: `adjustColor`, `getContrastColor`, `isValidHex`

### BodyMap (`src/components/BodyMap.tsx`)

Used by: Somatic model.

- SVG silhouette with 14 clickable `BodyRegion` paths
- Two interaction modes:
  - **Free selection** -- tap region, pick sensation + intensity via `SensationPicker`
  - **Guided scan** -- sequential head-to-feet `GuidedScan` overlay
- Enriches selections with `selectedSensation` and `selectedIntensity` before passing to model
- Region rendering order: back-facing first (upper-back, lower-back), then front-facing

### BodyRegion (`src/components/BodyRegion.tsx`)

- `motion.path` SVG element
- Fill color from sensation type color map (8 colors) or base gray
- Opacity encodes intensity (0.3 base + 0.2 per intensity level)
- Spring transitions on hover/tap

### body-paths.ts (`src/components/body-paths.ts`)

- 14 SVG path definitions in 200x440 viewBox
- Groups: head (5), torso (5), arms (2), legs (2)
- Each entry: `{ id, d (SVG path), anchor (popover position) }`

### SensationPicker (`src/components/SensationPicker.tsx`)

- Fixed-position popover near click point
- Two steps: sensation type (grid of 8) -> intensity (1-3 scale)
- Exports `SENSATION_CONFIG` (icon + bilingual label per sensation type)

### GuidedScan (`src/components/GuidedScan.tsx`)

- Three phases: `centering` (3s breathing prompt) -> `scanning` (14 regions) -> `complete`
- Progress bar tracks scan position
- Highlights current region on body map via `onHighlight` callback
- Quick sensation buttons per region, skip option

## Shared UI Components

### SelectionBar (`src/components/SelectionBar.tsx`)

- Displays selected emotions as colored chip buttons (click to deselect)
- Shows combo badges (dyads for Plutchik, match strengths for Somatic)
- Somatic selections show sensation icon + intensity via `SENSATION_CONFIG`
- Uses `isSomaticSelection()` type guard for conditional rendering
- `AnimatePresence mode="popLayout"` for chip animations

### Header (`src/components/Header.tsx`)

- App title + subtitle from i18n
- Contains `MenuButton` + `SettingsMenu` as children

### SettingsMenu (`src/components/SettingsMenu.tsx`)

- Animated dropdown (Framer Motion) with backdrop dismiss
- Two sections: language toggle (ro/en), model selector (all registered models)
- Reads model list from `getAvailableModels()`

### AnalyzeButton (`src/components/AnalyzeButton.tsx`)

- Purple-to-pink gradient when enabled, gray when disabled
- Text from i18n: `t.analyze.button` / `t.analyze.buttonDisabled`

### ResultModal (`src/components/ResultModal.tsx`)

- Backdrop blur overlay, spring-animated card
- Renders `AnalysisResult[]` with color-coded cards
- Shows: hierarchy path (Wheel), component labels (Plutchik dyads), descriptions
- Collapsible descriptions when >2 results
- "Explore with AI" link -> Google AI search with emotion names

## Hooks

### useEmotionModel (`src/hooks/useEmotionModel.ts`)

Central state machine. Inputs: `modelId`. Returns:

| Return | Type | Description |
|--------|------|-------------|
| `selections` | `BaseEmotion[]` | Currently selected emotions |
| `visibleEmotions` | `BaseEmotion[]` | Emotions to render in visualization |
| `sizes` | `Map<string, size>` | Size per visible emotion |
| `combos` | `AnalysisResult[]` | Live combo detection (filtered to those with componentLabels) |
| `handleSelect` | `(e) => void` | Select an emotion (delegates to model.onSelect) |
| `handleDeselect` | `(e) => void` | Deselect an emotion (delegates to model.onDeselect) |
| `handleClear` | `() => void` | Clear all (delegates to model.onClear) |
| `analyze` | `() => AnalysisResult[]` | Run full analysis |

Resets `selections` and `modelState` when `modelId` changes.

### useSound (`src/hooks/useSound.ts`)

- Web Audio API oscillator tones
- `select` = C5 (523.25 Hz), `deselect` = G4 (392 Hz)
- 150ms sine wave with exponential gain ramp
- Lazy `AudioContext` initialization, silent failure

## Animation Patterns

All animations use Framer Motion:

- **Bubbles:** `scale: 0 -> 1` spring enter, `scale: 0` exit, staggered by index
- **Body regions:** spring fill/opacity transitions
- **Selection chips:** spring `scale` with `layout` prop for reflow
- **Modals/menus:** `opacity` + `y` offset + `scale` transitions
- **MenuButton:** 3 bars morph to X via `rotate` + `opacity`

## Related Codemaps

- [Architecture](architecture.md) -- Overall structure, data flow, state management
- [Emotion Models](models.md) -- Model implementations driving the visualizations
