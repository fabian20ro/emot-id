# Frontend Codemap

**Last Updated:** 2026-02-03
**Framework:** React 19 (App Router-less SPA), Framer Motion 12, Tailwind CSS 4

## Component Tree

```
App (src/App.tsx)
 +-- Onboarding                   # 4-screen overlay (shown once, persisted)
 +-- Header
 |    +-- MenuButton              # Animated hamburger (3 bars -> X)
 |    +-- SettingsMenu            # Dropdown: language toggle + model selector + history access
 +-- ModelBar                     # Visible model indicator bar below header
 +-- AnalyzeButton                # Gradient CTA with selection count, disabled when empty
 +-- "I don't know" button        # Opens DontKnowModal (styled secondary button)
 +-- SelectionBar                 # Horizontal strip of selected emotion chips + combo badges
 |    +-- UndoToast               # 5-second undo toast after clear
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
 |    +-- MicroIntervention       # Breathing / savoring / curiosity exercise
 |    +-- OppositeAction          # DBT opposite action suggestion (amber box)
 |    +-- ModelBridge             # Cross-model bridge suggestion
 +-- SessionHistory               # History modal (vocabulary, patterns, export)
 +-- DontKnowModal               # Suggests Somatic or Dimensional model
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
- Fill color from sensation type color map (9 colors including constriction) or base gray
- Opacity encodes intensity (0.3 base + 0.2 per intensity level)
- Spring transitions on hover/tap

### body-paths.ts (`src/components/body-paths.ts`)

- 12 SVG path definitions in 200x440 viewBox (seated meditation pose)
- Groups: head (5), torso (5), arms (2), legs (2)
- Each entry: `{ id, d (SVG path), anchor (popover position) }`

### SensationPicker (`src/components/SensationPicker.tsx`)

- Fixed-position popover near click point
- Two steps: sensation type (grid of 9 including constriction) -> intensity (1-3 scale with anchor descriptions)
- Exports `SENSATION_CONFIG` (icon + bilingual label per sensation type)
- Framer Motion `drag="y"` swipe-to-dismiss gesture

### IntensityPicker (`src/components/IntensityPicker.tsx`)

- Reusable intensity selection (1-3 scale)
- Two variants: `detailed` (full labels + anchors) and `compact` (icon + dots)
- Intensity dot indicator (filled/unfilled circles)

### GuidedScan (`src/components/GuidedScan.tsx` + `guided-scan-constants.ts`)

- Constants and pure utils extracted to `guided-scan-constants.ts`: `BODY_GROUPS`, `SCAN_ORDER`, timing constants, `getGroupForIndex()`, `getNextGroupStartIndex()`
- Three phases: `centering` (10s breathing animation with progress bar) -> `scanning` (12 regions) -> `complete`
- Centering includes skip button; breathing emoji pulses with scale+opacity
- Scan order interleaves front/back by vertical level
- 2-step sensation flow: pick sensation -> pick intensity (1/2/3 with dot indicators)
- Shows all `commonSensations` per region (no truncation)
- Progress bar tracks scan position; highlights current region via `onHighlight` callback
- Somatic pause offered after intensity-3 selections

### DimensionalField (`src/components/DimensionalField.tsx`)

Used by: Dimensional model.

- SVG scatter plot in 500x500 viewBox with 50px padding
- Axes: X = valence (unpleasant to pleasant), Y = arousal (calm to intense)
- Quadrant dividers + axis labels (bilingual via `section('dimensional')`)
- Emotion dots: r=6 unselected, r=8 selected (with white stroke)
- Labels: dynamic Y offset (10px unselected, 16px selected to clear dot radius)
- Text halo via `paintOrder="stroke"` for readability in dense areas
- Click-to-place crosshair: converts pixel to valence/arousal, finds 3 nearest emotions
- Suggestion panel: shows nearest emotions as clickable chips (toggle select/deselect)

## Post-Analysis Components

### MicroIntervention (`src/components/MicroIntervention.tsx`)

- Three types: `breathing`, `savoring`, `curiosity`
- **Breathing**: 4-2-6 second guided cycle with animated circle, 3 rounds
- **Savoring**: 4-step mindful moment (recall, notice, breathe, expand) with auto-advance
- **Curiosity**: Reflective prompt for mixed-valence results
- `getInterventionType()` pure function determines type from arousal/valence profile
- Triggered from ResultModal after reflection flow

### SessionHistory (`src/components/SessionHistory.tsx`)

- Full-screen modal with focus trapping and backdrop dismiss
- **Vocabulary summary**: unique emotion count, models used, milestones (via `computeVocabulary`)
- **Valence ratio bar**: green/gray/red proportional bar for weekly pleasant/neutral/unpleasant
- **Somatic patterns**: top 5 body region frequency bars (via `computeSomaticPatterns`)
- **Session list**: `SessionRow` (memo'd) showing date, model, emotion names, reflection indicator
- **Footer actions**: clear all data, export text (therapy-formatted), export JSON
- Accessed via SettingsMenu > "Past sessions"

## Shared UI Components

### SelectionBar (`src/components/SelectionBar.tsx`)

- Displays selected emotions as colored chip buttons (click to deselect)
- Shows combo badges (dyads for Plutchik, match strengths for Somatic)
- Somatic selections show sensation icon + intensity via `SENSATION_CONFIG`
- Uses `isSomaticSelection()` type guard for conditional rendering
- `AnimatePresence mode="popLayout"` for chip animations
- Height capped: `max-h-[12vh] sm:max-h-[15vh]` to preserve visualization space
- Clear button with 5-second undo toast (stores previous selections in ref)

### Header (`src/components/Header.tsx`)

- App title + subtitle from i18n
- Contains `MenuButton` + `SettingsMenu` as children
- Passes `onOpenHistory` prop to SettingsMenu

### SettingsMenu (`src/components/SettingsMenu.tsx`)

- Animated dropdown (Framer Motion) with backdrop dismiss
- Sections: language toggle (ro/en), model selector (all registered models), history access
- Uses `section('menu')` for type-safe i18n
- Reads model list from `getAvailableModels()`

### AnalyzeButton (`src/components/AnalyzeButton.tsx`)

- Purple-to-pink gradient when enabled, gray when disabled
- Shows selection count: "Analyze (3)"
- Haptic feedback on mobile via `navigator.vibrate(10)`

### ResultModal (`src/components/ResultModal.tsx`)

- Backdrop blur overlay, spring-animated card
- Renders `AnalysisResult[]` via `ResultCard` components
- Narrative synthesis paragraph via `synthesize(results, language)`
- Crisis tier detection + temporal escalation via `escalateCrisisTier`
- Cross-model bridge suggestions via `getModelBridge()`
- DBT opposite action suggestions via `getOppositeAction()`
- Micro-intervention offer via `getInterventionType()`
- 3-state reflection flow: results -> reflection prompt -> follow-up actions
- Collapsible descriptions when >2 results
- Fires `onSessionComplete(reflectionAnswer)` on close

### CrisisBanner (`src/components/CrisisBanner.tsx`)

- Extracted from ResultModal for discoverability and independent testability
- Receives `tier` (CrisisTier) and `crisisT` (i18n strings) as props
- Tier 1: warm invitation with helpline numbers
- Tier 2/3: auto-expanded 5-4-3-2-1 grounding technique

### model-bridges.ts (`src/components/model-bridges.ts`)

- Pure function `getModelBridge(modelId, resultIds, bridgesT)` — no React dependencies
- Returns `{ message, targetModelId, buttonLabel }` or null
- Bridge mapping: Plutchik/Wheel -> Somatic, Somatic -> Wheel, Dimensional -> Wheel
- Pleasant emotion savoring bridges for embodiment

### ResultCard (`src/components/ResultCard.tsx`)

- Reusable card for a single `AnalysisResult`
- Shows: hierarchy path (Wheel), component labels (Plutchik dyads), match strength (Somatic), needs
- Collapsible description via `<details>` when not expanded
- Graduated exposure: high-distress results collapsed by default
- Color-coded gradient background from `result.color`

### Onboarding (`src/components/Onboarding.tsx`)

- 4-screen non-skippable onboarding overlay
- Persisted to localStorage via `storage.set('onboarded', 'true')`
- Skip button hidden on last screen (must tap "Start")
- Each screen: icon, title, body text from i18n
- Includes normalization messaging

### VisualizationErrorBoundary (`src/components/VisualizationErrorBoundary.tsx`)

- Class-based React error boundary (required for `getDerivedStateFromError`)
- Bilingual error message + retry button
- Resets model state on retry via `onReset` prop
- Keyed by `modelId` in App to auto-reset on model switch

## Hooks

### useModelSelection (`src/hooks/useModelSelection.ts`)

- Manages active model ID with localStorage persistence via `storage.ts`
- Validates that saved model IDs reference valid registered models
- Returns `{ modelId, switchModel }`

### useHintState (`src/hooks/useHintState.ts`)

- Manages per-model first-interaction hint visibility
- Hints dismissed on first selection, persisted via `storage.ts`
- Returns `{ showHint, dismissHint }`

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

### useSessionHistory (`src/hooks/useSessionHistory.ts`)

- Wraps IndexedDB session repository with React state
- Loads sessions asynchronously on mount
- Returns `{ sessions, loading, save, remove, clearAll, exportJSON }`

### useSound (`src/hooks/useSound.ts`)

- Web Audio API oscillator tones
- `select` = C5 (523.25 Hz), `deselect` = G4 (392 Hz)
- 150ms sine wave with exponential gain ramp
- Lazy `AudioContext` initialization, silent failure
- Mute state persisted via `storage.ts`

### useFocusTrap (`src/hooks/useFocusTrap.ts`)

- Focus trapping for modals: Tab cycles within modal, Escape closes
- Returns ref to attach to modal container
- Restores focus to trigger element on close

## Animation Patterns

All animations use Framer Motion:

- **Bubbles:** `scale: 0 -> 1` spring enter, `scale: 0` exit, staggered by index
- **Body regions:** spring fill/opacity transitions
- **Dimensional dots:** spring `r` and `fillOpacity` transitions
- **Selection chips:** spring `scale` with `layout` prop for reflow
- **Modals/menus:** `opacity` + `y` offset + `scale` transitions
- **MenuButton:** 3 bars morph to X via `rotate` + `opacity`
- **Onboarding:** slide transitions between screens
- **MicroIntervention breathing:** scale 0.9-1.2 with 4/6s timing
- **SensationPicker:** `drag="y"` swipe-to-dismiss gesture
- **App:** `<MotionConfig reducedMotion="user">` respects OS preference

## Related Codemaps

- [Architecture](architecture.md) -- Overall structure, data flow, state management
- [Emotion Models](models.md) -- Model implementations driving the visualizations
