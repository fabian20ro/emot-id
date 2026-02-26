# Frontend Codemap

**Last Updated:** 2026-02-26

## Component Tree

```
App (src/App.tsx)
 +-- Onboarding                   # 4-screen overlay (shown once)
 +-- Header                       # 48px merged row
 |    +-- MenuButton              # Animated hamburger
 |    +-- ModelBar (inline)       # Model tab bar
 +-- SettingsMenu*                # Bottom sheet drawer (portal to body)
 +-- AnalyzeButton                # Gradient CTA with selection count
 +-- QuickCheckIn                 # 30-second curated emotion grid
 +-- GranularityTraining          # Practice mode for emotion discrimination
 +-- ChainAnalysis                # DBT worksheet mode
 +-- SelectionBar                 # Horizontal scroll strip with clear/undo
 +-- FirstInteractionHint         # Per-model hint
 +-- VisualizationErrorBoundary
 |    +-- Visualization**
 |         +-- BubbleField        # For plutchik, wheel
 |         +-- BodyMap            # For somatic
 |         +-- DimensionalField   # For dimensional
 +-- ResultModal                  # Analysis results orchestrator
 |    +-- ResultsView / ReflectionView / WarmCloseView / FollowUpView
 |    +-- CrisisBanner            # Tiered crisis banner
 |    +-- MicroIntervention       # Post-analysis exercises
 +-- DontKnowModal / UndoToast / SessionHistory
```

`*` Portal to body. `**` Dynamic via registry, lazy-loaded inside `Suspense`.

## Non-Obvious Behaviors

### BubbleField Mobile Layout

Mobile placement (<480px) uses deterministic wrapped-row layout with shuffled order each render to reduce positional bias. Vertical distribution evenly spaces rows (`idealSpacing = (availableVertical - totalContentHeight) / (rows - 1)`, capped at `bubbleHeight * 3`). Jitter scales with row spacing (`min(6, floor(rowSpacing * 0.15))`) for organic feel without overlap. Desktop uses random placement with collision detection.

### BodyMap Height-Fit Rendering

BodyMap uses height-driven fit: root `h-full min-h-0 w-full`, SVG `h-full w-auto max-w-full`. This ensures the body remains fully visible in constrained mobile heights. If feet disappear, inspect the sizing chain via `data-testid="bodymap-root"` and `data-testid="bodymap-canvas"`.

Back regions are widened ~15px beyond front regions for visible/clickable slivers. Small regions (throat, jaw) have expanded `hitD` paths for robust touch targets.

### DimensionalField Label Collision

Labels use a greedy sort-and-bump algorithm (sort by y then x, bump by `MIN_GAP=14` when labels overlap within 40px horizontal proximity, clamp to viewBox bounds). Text halo via `paintOrder="stroke"` for readability in dense areas.

Suggestion chips render in a normal-flow tray below the plot (not overlay) to avoid obscuring dots.

### SelectionBar Reserved Height

SelectionBar maintains a fixed `52px` reserved height even when empty, preventing visualization area reflow on first selection.

## Related Codemaps

- [Architecture](architecture.md)
- [Emotion Models](models.md)
