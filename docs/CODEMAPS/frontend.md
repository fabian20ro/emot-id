# Frontend Codemap

**Last Updated:** 2026-02-25
**Framework:** React 19 (App Router-less SPA), Framer Motion 12, Tailwind CSS 4

## Component Tree

```
App (src/App.tsx)
 +-- Onboarding                   # 4-screen overlay (shown once, persisted; mobile-safe 44px controls)
 +-- Header                       # 48px merged row
 |    +-- MenuButton              # Animated hamburger (3 bars -> X)
 |    +-- ModelBar (inline)       # Model tab bar (flex-1, responsive shortName at <480px)
 +-- Offline banner               # Shows when navigator is offline (cached/PWA state)
 +-- SettingsMenu*                # Bottom sheet drawer (portal to body)
 |    +-- SettingsToggle[]        # Reusable on/off toggle component
 |    +-- InfoButton[]            # Privacy + disclaimer info modals (portal to body)
 +-- AnalyzeButton                # Gradient CTA with selection count, disabled when empty
 +-- QuickCheckIn                 # 30-second curated emotion grid (tap up to 3)
 +-- GranularityTraining          # Optional practice mode for finer emotion discrimination
 +-- ChainAnalysis                # DBT worksheet mode (trigger -> consequence sequence)
 +-- "I don't know" text link     # Opens DontKnowModal (hidden while showHint visible)
 +-- SelectionBar                 # Horizontal scroll strip: reserved-height row to prevent viz jump
 +-- FirstInteractionHint         # Per-model hint (flow-based, above visualization)
 +-- VisualizationErrorBoundary   # Class-based error boundary (bilingual)
 |    +-- Visualization**         # Resolved from registry per model ID
 |         +-- BubbleField        # For plutchik, wheel (evenly distributed on mobile)
 |         |    +-- Bubble[]      # Animated pill buttons with emotion color
 |         +-- BodyMap            # For somatic (height-fit layout, expanded hit areas, wider labels)
 |         |    +-- BodyRegion[]  # SVG path elements (12 regions)
 |         |    +-- SensationPicker  # Bottom sheet: sensation -> intensity
 |         |    +-- GuidedScan    # Sequential body scan overlay
 |         |    |    +-- CenteringPhase / PausePhase / CompletionPhase  # Extracted phase views
 |         +-- DimensionalField   # For dimensional (aspect-square plot + suggestion tray below)
 +-- ResultModal                  # Orchestrator modal (imports sub-views)
 |    +-- ResultsView             # Main results display (AI link, reflection prompt, info panel)
 |    |    +-- CrisisBanner       # Tiered crisis banner — renders ABOVE results (tier1/2/3/4)
 |    |    +-- ResultCard[]       # Color-coded result cards (InfoButton for collapsed descriptions)
 |    +-- ReflectionView          # Yes/Somewhat/Not really reflection prompt
 |    +-- WarmCloseView           # Brief acknowledgment after "Yes" reflection
 |    +-- FollowUpView            # Explore more / model bridge after "No"/"Somewhat"
 |    +-- MicroIntervention       # Breathing / savoring / curiosity exercise
 +-- DontKnowModal               # Suggests Somatic or Dimensional model (explicit close button)
 +-- UndoToast                   # 5-second undo toast after clear
 +-- SessionHistory              # History modal (imports panels and utils)
 |    +-- VocabSummary / ProgressionNudge / ValenceRatioPanel / SomaticPatternsPanel
```

`*` SettingsMenu renders via `createPortal(…, document.body)` — portal sibling, not child of Header.
`**` Visualization component is dynamic and lazy-loaded: `getVisualization(modelId)` from registry, rendered inside `Suspense`.

## Visualization System

### BubbleField (`src/components/BubbleField.tsx`)

Used by: Plutchik, Wheel models.

- Renders emotion `Bubble` components with absolute positioning
- Uses `ResizeObserver` to track container dimensions
- Placement: deterministic wrapped-row on mobile (<480px), random with collision detection on desktop
- Mobile order is shuffled each render before deterministic row wrapping to reduce positional bias
- Mobile padding 8px, desktop 16px; min-height 200px
- Mobile vertical distribution: rows evenly spaced (`idealSpacing = (availableVertical - totalContentHeight) / (rows - 1)`, capped at `bubbleHeight * 3`); single row centers vertically. Desktop top-aligned.
- Jitter scales with row spacing on mobile (`min(6, floor(rowSpacing * 0.15))`) for organic feel without overlap
- Positions are memoized: existing bubbles keep position, only new ones are placed
- Clamping: `Math.max(16, Math.min(pos, containerSize - bubbleSize - 16))` prevents edge clipping
- Grid fallback: when random placement fails after 100 attempts, lays out in a grid; x/y clamped to `containerWidth - w - padding` to prevent overflow
- `AnimatePresence mode="popLayout"` for enter/exit animations

**Props:** `VisualizationProps { emotions, onSelect, onDeselect?, sizes, selections? }`

### Bubble (`src/components/Bubble.tsx`)

- Framer Motion `motion.button` with spring enter/exit
- Sizes: `small` / `medium` / `large` mapped to Tailwind padding classes
- Color: inline `linear-gradient` from `emotion.color`, auto text contrast
- Helper functions: `adjustColor`, `getContrastColor`, `isValidHex`

### BodyMap (`src/components/BodyMap.tsx`)

Used by: Somatic model.

- SVG silhouette with 12 clickable `BodyRegion` paths (standing relaxed pose)
- Two interaction modes:
  - **Free selection** -- tap region, pick sensation + intensity via `SensationPicker`
  - **Guided scan** -- sequential head-to-feet `GuidedScan` overlay
- Enriches selections with `selectedSensation` and `selectedIntensity` before passing to model
- Routes deselect through `onDeselect(enrichedSelection)` using selection map lookup
- Region rendering order: back-facing first (upper-back, lower-back), then front-facing
- Back regions widened ~15px beyond front regions for visible/clickable slivers
- Height-driven fit: root uses `h-full min-h-0 w-full`; SVG uses `h-full w-auto max-w-full` so body remains fully visible in constrained mobile heights
- Label pills use adaptive wider widths and compression for long localized text; right-side labels are nudged farther right for cleaner separation
- Label tap affordance uses invisible 48px-high hit rectangles
- `data-testid` hooks: `bodymap-root`, `bodymap-canvas` for deterministic layout tests

### BodyRegion (`src/components/BodyRegion.tsx`)

- `motion.path` SVG element
- Fill color from sensation type color map (9 colors including constriction) or base gray
- Opacity encodes intensity (0.3 base + 0.2 per intensity level)
- Spring transitions on hover/tap

### body-paths.ts (`src/components/body-paths.ts`)

- 12 SVG path definitions in 300x450 viewBox (`-50 -10 300 450`)
- Groups: head (3: head, jaw, throat), torso (5: shoulders, chest, upper-back, stomach, lower-back), arms (2: arms, hands), legs (2: legs, feet)
- Each entry: `{ id, d, hitD? (enlarged hit area), anchor, labelAnchor, labelSide }`
- Labels alternate R,L,R,L by y-position with anatomical pair constraints (chest/upper-back and stomach/lower-back placed on opposite sides). Sides: head(R), jaw(L), throat(R), shoulders(L), chest(R), upper-back(L), stomach(L), lower-back(R), arms(R), hands(L), legs(R), feet(L)
- Small regions (throat, jaw) have expanded `hitD` paths for robust mobile touch targets; throat path is vertically extended to maintain visible neck continuity with shoulders

### SensationPicker (`src/components/SensationPicker.tsx`)

- Bottom sheet with `drag="y"` swipe-to-dismiss gesture
- Uses shared `ModalShell` backdrop/dialog semantics
- Two steps: sensation type (2-column grid of 9 buttons) -> intensity (1-3 scale, compact variant)
- Randomizes sensation order each render to reduce primacy bias
- Sensation buttons use horizontal icon+text layout (`flex items-center gap-2`) instead of vertical stacking
- All interactive elements meet 44px minimum touch target (back button, "Nothing here", sensation buttons)
- Exports `SENSATION_CONFIG` (icon + bilingual label per sensation type)

### IntensityPicker (`src/components/IntensityPicker.tsx`)

- Reusable intensity selection (1-3 scale)
- Two variants: `detailed` (full labels + anchors) and `compact` (icon + dots)
- Intensity dot indicator (filled/unfilled circles)

### GuidedScan (`src/components/GuidedScan.tsx` + `guided-scan-constants.ts`)

- Constants and pure utils extracted to `guided-scan-constants.ts`: `BODY_GROUPS`, `SCAN_ORDER`, timing constants, `getGroupForIndex()`, `getNextGroupStartIndex()`
- Three phases: `centering` (10s breathing animation with progress bar) -> `scanning` (12 regions) -> `complete`
- Centering includes optional "take more time" and skip-arrow controls; breathing emoji pulses with scale+opacity
- Scan order interleaves front/back by vertical level
- 2-step sensation flow: pick sensation -> pick intensity (1/2/3 with dot indicators)
- Shows all `commonSensations` per region (no truncation)
- Randomizes sensation button order per region
- Progress bar tracks scan position; highlights current region via `onHighlight` callback
- Somatic pause offered after intensity-3 selections
- If many regions are skipped (`skipCount >= 6`), completion view shows interoception development tips

### DimensionalField (`src/components/DimensionalField.tsx`)

Used by: Dimensional model.

- SVG scatter plot in 500x500 viewBox with 30px padding (`INNER=440`, ~21% more area than previous 50px), `aspect-square` CSS constraint
- Container maximizes width on mobile (fills ~391px on 393px viewport)
- Instructions hidden on mobile (`hidden sm:block`), shown on desktop
- Axes: X = valence (unpleasant to pleasant), Y = arousal (calm to intense)
- Quadrant dividers + axis labels (bilingual via `section('dimensional')`)
- Emotion dots: r=11 unselected, r=14 selected (with white stroke)
- Labels: dynamic Y offset (16px unselected, 22px selected to clear dot radius) with collision avoidance
- Axis labels remain visible after interaction for persistent orientation cues
- Label collision avoidance: greedy sort-and-bump algorithm (sort by y then x, bump by `MIN_GAP=14` when labels overlap within 40px horizontal proximity, clamp to viewBox bounds)
- Text halo via `paintOrder="stroke"` for readability in dense areas
- Click-to-place crosshair: converts pixel to valence/arousal, finds 3 nearest emotions
- Suggestion chips: rendered in a normal-flow tray below the plot (non-overlay) to avoid obscuring lower-emotion areas
- Suggestion chips use 48px minimum touch height for easier mobile tapping
- `data-testid` hooks: `dimensional-plot-container`, `dimensional-suggestion-tray`

## Post-Analysis Components

### MicroIntervention (`src/components/MicroIntervention.tsx`)

- Three types: `breathing`, `savoring`, `curiosity`
- **Breathing**: 4-2-6 second guided cycle with animated circle, 3 rounds
- **Savoring**: 4-step mindful moment (recall, notice, breathe, expand) with auto-advance
- **Curiosity**: Reflective prompt for mixed-valence results
- `getInterventionType()` pure function determines type from arousal/valence profile
- Triggered from ResultModal after reflection flow
- Post-practice check-in captures `better` / `same` / `worse`; `worse` shows validation copy

### SessionHistory (`src/components/SessionHistory.tsx`)

- Full-screen modal with focus trapping and backdrop dismiss
- Uses shared `ModalShell` and safe-area-aware top/bottom insets
- **Vocabulary summary**: active vs passive counts, models used, milestones (via `computeVocabulary`)
- **Top identified list**: up to 15 most frequently identified emotions (chips with per-emotion counts)
- **Progression nudge**: dismissible directional suggestion after 3+ sessions on one model
- **Valence ratio bar**: green/gray/red proportional bar for weekly pleasant/neutral/unpleasant
- **Valence trend**: 4-week stacked mini-bars (oldest to newest)
- **Somatic patterns**: top 5 body region frequency bars (via `computeSomaticPatterns`)
- **Session list**: `SessionRow` (memo'd) showing date, localized model name, emotion names, reflection indicator
- Somatic pattern rows show localized body-region labels (instead of raw IDs)
- **Footer actions**: clear all data, export text (therapy-formatted), export JSON (all 44px targets)
- Accessed via SettingsMenu > "Past sessions"

## Shared UI Components

### ModalShell (`src/components/ModalShell.tsx`)

- Shared overlay primitive for modalized surfaces
- Provides consistent backdrop animation, `role="dialog"` semantics, and click-outside close behavior
- Accepts custom `panelProps` so centered dialogs and draggable bottom sheets reuse one shell
- Used by: `ResultModal`, `DontKnowModal`, `SessionHistory`, `SensationPicker`

### SelectionBar (`src/components/SelectionBar.tsx`)

- Single horizontal scroll row (`overflow-x-auto scrollbar-hide`) with fixed reserved height (`52px`)
- Layout: `[Clear button] [Emotion chips...] [Combo badges...]` — all inline
- Right-edge gradient fade when content overflows
- Displays selected emotions as colored chip buttons (click to deselect)
- Shows combo badges inline (dyads for Plutchik, match strengths for Somatic)
- Somatic selections show sensation icon + intensity via `SENSATION_CONFIG`
- Uses `isSomaticSelection()` type guard for conditional rendering
- `AnimatePresence mode="popLayout"` for chip animations
- All interactive elements: `min-h-[44px]` touch targets
- Clear button with 5-second undo toast (stores previous selections in ref)
- Empty state keeps collapsed placeholder height so visualization area does not reflow

### Header (`src/components/Header.tsx`)

- Single 48px row: `[MenuButton] [ModelBar (inline)]`
- No title/subtitle on main screen (app name moved to SettingsMenu drawer header)
- Applies `pt-[env(safe-area-inset-top)]` for notched devices
- Accepts `menuOpen`, `onMenuToggle`, `modelId`, `onModelChange` props from App

### SettingsMenu (`src/components/SettingsMenu.tsx`)

- Bottom sheet drawer rendered via `createPortal(…, document.body)` at `z-[var(--z-modal)]`
- Spring animation: `y: '100%' → y: 0`, swipe-to-dismiss (`drag="y"`, offset.y > 100 || velocity.y > 500)
- Drag handle bar at top, "Emot-ID" as drawer title, max-h `85dvh`, `overscroll-contain`
- Focus trap via `useFocusTrap`, backdrop dismiss, Escape closes
- Sections: language toggle (ro/en), simple-language mode, model selector, sound on/off, save sessions on/off, daily reminder toggle, past sessions, granularity practice, chain analysis, crisis support, privacy, disclaimer
- All interactive elements: `min-h-[44px]` touch targets
- Save sessions toggle: On/Off in privacy section; toggling off prompts confirmation to delete existing sessions; when off, hides "Past sessions" link
- Reminder toggle: opt-in only, permission-aware, default off
- Info button rows use `items-start` alignment with `pt-2` on text and `pt-0.5` on info button containers for top-aligned layout
- Privacy and disclaimer sections use `InfoButton` (portal-based info modals)
- Uses `section('menu')`, `section('settings')`, `section('privacy')`, `section('disclaimer')`, `section('history')` for i18n
- Reads model list from `getAvailableModels()`

### AnalyzeButton (`src/components/AnalyzeButton.tsx`)

- Purple-to-pink gradient when enabled, gray when disabled
- Compact mobile sizing: `py-2.5 text-base` (~48px, meets 44px minimum)
- Shows selection count: "Analyze (3)"
- Haptic feedback on mobile via `navigator.vibrate(10)`

### ResultModal (`src/components/ResultModal.tsx`)

- Backdrop blur overlay, spring-animated card
- Uses shared `ModalShell` for consistent dialog semantics and layering
- Selection display: colored pills with emotion color background/border (replaces verbose text)
- Renders `AnalysisResult[]` via `ResultCard` components (tighter spacing: `mb-3`, `p-3`)
- CrisisBanner renders first (above results) when crisis tier detected
- Graduated crisis access: tier1-3 show crisis banner alongside all features (AI link, opposite action, micro-interventions); only tier4 pre-acknowledgment gates features
- Narrative synthesis paragraph via `synthesize(results, language)`
- Crisis tier detection + temporal escalation via `escalateCrisisTier`
- Suggestions section: bridge + opposite action grouped in single `space-y-2` block
- Footer section: micro-intervention offer, reflection trigger, disclaimer -- all in `pt-2 space-y-1.5`
- Header close action is explicit `44x44` and dialog uses `aria-labelledby`
- Micro-intervention offer via `getInterventionType()`
- 3-state reflection flow: results -> reflection prompt -> follow-up actions
- Reflection prompts can switch to simplified copy when simple-language mode is enabled
- Persists both reflection answer and post-intervention response into saved sessions
- Collapsible descriptions when >2 results
- Fires `onSessionComplete(reflectionAnswer)` on close

### CrisisBanner (`src/components/CrisisBanner.tsx`)

- Renders ABOVE results and synthesis narrative in ResultModal (first visible element in crisis)
- Receives `tier` (CrisisTier) and `crisisT` (i18n strings) as props
- Tier 1: warm invitation with helpline numbers
- Tier 2/3: auto-expanded 5-4-3-2-1 grounding technique
- Tier 4: red emergency variant, explicit acknowledgment gate in ResultModal (AI link, opposite action, micro-interventions gated behind ack; available after user acknowledges)
- Helpline link: full-width 48px CTA (amber tiers 1-3, red for tier 4)

### model-bridges.ts (`src/components/model-bridges.ts`)

- Pure function `getModelBridge(modelId, resultIds, bridgesT)` — no React dependencies
- Returns `{ message, targetModelId, buttonLabel }` or null
- Bridge mapping: Plutchik/Wheel -> Somatic, Somatic -> Wheel, Dimensional -> Somatic
- Pleasant emotion savoring bridges for embodiment

### ResultCard (`src/components/ResultCard.tsx`)

- Reusable card for a single `AnalysisResult`
- Shows: hierarchy path (Wheel), component labels (Plutchik dyads), match strength (Somatic), needs
- Collapsed descriptions use `InfoButton` (portal-based info modal) instead of `<details>`
- Graduated exposure: high-distress results collapsed by default with gentler aria-label
- Color-coded gradient background from `result.color`

### InfoButton (`src/components/InfoButton.tsx`)

- Reusable info trigger + modal for contextual detail (replaces inline `<details>`)
- Props: `title`, `ariaLabel`, `children` (ReactNode), optional `className`
- Renders trigger as 44x44px touch target with SVG info icon
- Dialog rendered via `createPortal(…, document.body)` at `z-[var(--z-onboarding)]` to escape parent stacking contexts
- Focus trap via `useFocusTrap`, backdrop dismiss, Framer Motion `AnimatePresence` enter/exit
- Used in: SettingsMenu (privacy, disclaimer), ResultCard (collapsed descriptions)

### Onboarding (`src/components/Onboarding.tsx`)

- 4-screen onboarding overlay
- Persisted to localStorage via `storage.set('onboarded', 'true')`
- No skip path — users complete all four safety/disclaimer screens before first use
- Final step requires explicit model selection before "Get started" (removes first-launch default anchoring bias)
- Navigation actions use explicit 44px targets for compact mobile
- Dialog panel is scrollable (`max-h`) to prevent overflow on text-heavy small screens
- Each screen: icon, title, body text from i18n (with simplified variants when simple-language mode is enabled)
- Includes normalization messaging

### QuickCheckIn (`src/components/QuickCheckIn.tsx`)

- Standalone modal for rapid self-check (`1-3` selections, no model navigation required)
- Curated emotion set includes distress IDs (`despair`, `helpless`, `numb`) so full crisis routing still applies
- Outputs regular `AnalysisResult[]` and reuses `ResultModal` pipeline (crisis, synthesis, reflection, session save)

### GranularityTraining (`src/components/GranularityTraining.tsx`)

- Optional practice modal launched from Settings
- Presents sets of similar emotions (2-3+) and asks users to discriminate best fit
- Includes "not sure" option and quick progression through multiple sets

### ChainAnalysis (`src/components/ChainAnalysis.tsx`)

- Optional DBT skill-building modal launched from Settings
- Sequential prompts: triggering event, vulnerability factors, prompting event, emotion, urge, action, consequence
- Saves entries to IndexedDB and surfaces recent chains for quick review

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
