# Frontend Codemap

**Last Updated:** 2026-02-02
**Framework:** React 19 (App Router-less SPA), Framer Motion 12, Tailwind CSS 4

## Component Tree

```
App (src/App.tsx)
 +-- Onboarding                   # 4-screen overlay (shown once, persisted)
 +-- Header
 |    +-- MenuButton              # Animated hamburger (3 bars -> X)
 |    +-- SettingsMenu            # Dropdown: language toggle + model selector
 +-- AnalyzeButton                # Gradient CTA, disabled when no selections
 +-- "I don't know" link          # Opens DontKnowModal
 +-- SelectionBar                 # Horizontal strip of selected emotion chips + combo badges
 +-- FirstInteractionHint         # Per-model hint (flow-based, above visualization)
 +-- VisualizationErrorBoundary   # Class-based error boundary (bilingual)
 |    +-- Visualization*          # Resolved from registry per model ID
 |         +-- BubbleField        # For plutchik, wheel
 |         |    +-- Bubble[]      # Animated pill buttons with emotion color
 |         +-- BodyMap            # For somatic
 |         |    +-- BodyRegion[]  # SVG path elements (12 regions)
 |         |    +-- SensationPicker  # 2-step popover (sensation -> intensity)
 |         |    +-- GuidedScan    # Sequential body scan overlay
 |         +-- DimensionalField   # For dimensional (2D scatter plot)
 +-- ResultModal                  # Full-screen modal with analysis results
 |    +-- ResultCard[]            # Color-coded result cards
 |    +-- CrisisBanner            # Tiered crisis banner (tier1/2/3)
 +-- DontKnowModal               # Suggests Somatic or Dimensional model (src/components/DontKnowModal.tsx)
```

`*` Visualization component is dynamic: `getVisualization(modelId)` from registry.

## Visualization System

### BubbleField (`src/components/BubbleField.tsx`)

Used by: Plutchik, Wheel models.

- Renders emotion `Bubble` components with absolute positioning
- Uses `ResizeObserver` to track container dimensions
- Placement: random with collision detection (100 attempts), grid fallback
- 16px padding from edges, min-height 200px
- Positions are memoized: existing bubbles keep position, only new ones are placed
- Clamping: `Math.max(16, Math.min(pos, containerSize - bubbleSize - 16))` prevents edge clipping
- `AnimatePresence mode="popLayout"` for enter/exit animations

**Props:** `VisualizationProps { emotions, onSelect, onDeselect?, sizes, selections? }`

### Bubble (`src/components/Bubble.tsx`)

- Framer Motion `motion.button` with spring enter/exit
- Sizes: `small` / `medium` / `large` mapped to Tailwind padding classes
- Color: inline `linear-gradient` from `emotion.color`, auto text contrast
- Helper functions: `adjustColor`, `getContrastColor`, `isValidHex`

### BodyMap (`src/components/BodyMap.tsx`)

Used by: Somatic model.

- SVG silhouette with 12 clickable `BodyRegion` paths (seated meditation pose)
- Two interaction modes:
  - **Free selection** -- tap region, pick sensation + intensity via `SensationPicker`
  - **Guided scan** -- sequential head-to-feet `GuidedScan` overlay
- Enriches selections with `selectedSensation` and `selectedIntensity` before passing to model
- Routes deselect through `onDeselect(enrichedSelection)` using selection map lookup
- Region rendering order: back-facing first (upper-back, lower-back), then front-facing
- Back regions widened ~15px beyond front regions for visible/clickable slivers

### BodyRegion (`src/components/BodyRegion.tsx`)

- `motion.path` SVG element
- Fill color from sensation type color map (8 colors) or base gray
- Opacity encodes intensity (0.3 base + 0.2 per intensity level)
- Spring transitions on hover/tap

### body-paths.ts (`src/components/body-paths.ts`)

- 12 SVG path definitions in 200x440 viewBox (seated meditation pose)
- Groups: head (5), torso (5), arms (2), legs (2)
- Each entry: `{ id, d (SVG path), anchor (popover position) }`

### SensationPicker (`src/components/SensationPicker.tsx`)

- Fixed-position popover near click point
- Two steps: sensation type (grid of 8) -> intensity (1-3 scale with anchor descriptions)
- Exports `SENSATION_CONFIG` (icon + bilingual label per sensation type)

### IntensityPicker (`src/components/IntensityPicker.tsx`)

- Reusable intensity selection (1-3 scale)
- Two variants: `detailed` (full labels + anchors) and `compact` (icon + dots)
- Intensity dot indicator (filled/unfilled circles)

### GuidedScan (`src/components/GuidedScan.tsx` + `guided-scan-constants.ts`)

- Constants and pure utils extracted to `guided-scan-constants.ts`: `BODY_GROUPS`, `SCAN_ORDER`, timing constants, `getGroupForIndex()`, `getNextGroupStartIndex()`
- Three phases: `centering` (10s breathing animation with progress bar) -> `scanning` (12 regions) -> `complete`
- Centering includes skip button; breathing emoji pulses with scale+opacity
- Scan order interleaves front/back by vertical level (head -> throat/shoulders/upper-back -> chest/stomach/lower-back -> arms -> legs)
- 2-step sensation flow: pick sensation (icon + label from `SENSATION_CONFIG`) -> pick intensity (1/2/3 with dot indicators)
- Shows all `commonSensations` per region (no truncation)
- Progress bar tracks scan position; highlights current region via `onHighlight` callback

### DimensionalField (`src/components/DimensionalField.tsx`)

Used by: Dimensional model.

- SVG scatter plot in 500x500 viewBox with 50px padding
- Axes: X = valence (unpleasant to pleasant), Y = arousal (calm to intense)
- Quadrant dividers + axis labels (bilingual)
- Emotion dots: r=6 unselected, r=8 selected (with white stroke)
- Labels: dynamic Y offset (10px unselected, 16px selected to clear dot radius)
- Text halo via `paintOrder="stroke"` for readability in dense areas
- Click-to-place crosshair: converts pixel to valence/arousal, finds 3 nearest emotions
- Suggestion panel: shows nearest emotions as clickable chips (toggle select/deselect)

## Shared UI Components

### SelectionBar (`src/components/SelectionBar.tsx`)

- Displays selected emotions as colored chip buttons (click to deselect)
- Shows combo badges (dyads for Plutchik, match strengths for Somatic)
- Somatic selections show sensation icon + intensity via `SENSATION_CONFIG`
- Uses `isSomaticSelection()` type guard for conditional rendering
- `AnimatePresence mode="popLayout"` for chip animations
- Height capped: `max-h-[12vh] sm:max-h-[15vh]` to preserve visualization space

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
- Renders `AnalysisResult[]` via `ResultCard` components
- Narrative synthesis paragraph via `synthesize(results, language)`
- Crisis tier detection via `CrisisBanner` component (extracted to `CrisisBanner.tsx`)
- Cross-model bridge suggestions via `getModelBridge()` (extracted to `model-bridges.ts`)
- 3-state reflection flow: results -> reflection prompt -> follow-up actions
- Collapsible descriptions when >2 results
- "Explore with AI" link -> Google AI search with emotion names

### CrisisBanner (`src/components/CrisisBanner.tsx`)

- Extracted from ResultModal for discoverability and independent testability
- Receives `tier` (CrisisTier) and `crisisT` (i18n strings) as props
- Tier 1: warm invitation with helpline numbers
- Tier 2/3: adds collapsible 5-4-3-2-1 grounding technique

### model-bridges.ts (`src/components/model-bridges.ts`)

- Pure function `getModelBridge(modelId, resultIds, bridgesT)` — no React dependencies
- Returns `{ message, targetModelId, buttonLabel }` or null
- Bridge mapping: Plutchik/Wheel -> Somatic, Somatic -> Wheel, Dimensional -> Wheel

### ResultCard (`src/components/ResultCard.tsx`)

- Reusable card for a single `AnalysisResult`
- Shows: hierarchy path (Wheel), component labels (Plutchik dyads), match strength (Somatic), needs
- Collapsible description via `<details>` when not expanded
- Color-coded gradient background from `result.color`

### Onboarding (`src/components/Onboarding.tsx`)

- 4-screen non-skippable onboarding overlay
- Persisted to localStorage (`emot-id-onboarded`)
- Skip button hidden on last screen (must tap "Start")
- Each screen: icon, title, body text from i18n

### VisualizationErrorBoundary (`src/components/VisualizationErrorBoundary.tsx`)

- Class-based React error boundary (required for `getDerivedStateFromError`)
- Bilingual error message + retry button
- Resets model state on retry via `onReset` prop
- Keyed by `modelId` in App to auto-reset on model switch

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
- Mute state persisted to localStorage (`emot-id-sound-muted`)

## Animation Patterns

All animations use Framer Motion:

- **Bubbles:** `scale: 0 -> 1` spring enter, `scale: 0` exit, staggered by index
- **Body regions:** spring fill/opacity transitions
- **Dimensional dots:** spring `r` and `fillOpacity` transitions
- **Selection chips:** spring `scale` with `layout` prop for reflow
- **Modals/menus:** `opacity` + `y` offset + `scale` transitions
- **MenuButton:** 3 bars morph to X via `rotate` + `opacity`
- **Onboarding:** slide transitions between screens

## Related Codemaps

- [Architecture](architecture.md) -- Overall structure, data flow, state management
- [Emotion Models](models.md) -- Model implementations driving the visualizations
