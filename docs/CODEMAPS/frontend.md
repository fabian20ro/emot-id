# Frontend Codemap

**Last Updated:** 2026-07-23

## Component Tree

```
App (src/App.tsx)
 +-- Onboarding                   # 4-screen overlay (shown once)
 +-- AppShell                     # Persistent header, content, bottom tabs
 +-- TodayScreen                  # Quick emotions and recent reflection
 +-- ArrivalScreen                # Route chooser
 +-- ModelCheckInScreen           # Affect map and Plutchik flows
 |    +-- Visualization**
 |         +-- BubbleField        # Plutchik
 |         +-- DimensionalField   # Affect map
 +-- WordLadderScreen             # Hierarchical emotion vocabulary
 +-- BodyCompassScreen            # Somatic route
 |    +-- BodyMap                 # Lazy-loaded body visualization
 +-- ReflectionScreen             # Results, crisis support, needs, next step
 +-- ExploreScreen                # Route and practice entry points
 +-- JournalScreen                # Sessions, summaries, chain entry
 +-- SessionDetailScreen          # Saved reflection details
 +-- SettingsScreen               # Preferences
 +-- PrivacyDataScreen            # Storage, export, destructive confirmation*
 +-- SupportScreen                # Crisis and product boundaries
 +-- GranularityTraining          # Full-screen practice flow
 +-- ChainAnalysis                # Full-screen DBT worksheet
```

`*` Confirmation uses `ModalShell`, portaled to `document.body` with focus trapping.
`**` Visualization resolved by model registry; BodyMap stays lazy-loaded.

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
