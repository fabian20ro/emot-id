# Emot-ID Improvement Plan

Multi-perspective review synthesized into a prioritized roadmap.

## Phase K: Mobile Stabilization

Target: Pixel 9a Chrome (393×742 visible). Must also work on 320×604 minimum.

- [x] K.1 Fix settings menu — portal out of Header + bottom sheet drawer
- [x] K.2 Merge Header + ModelBar into single 48px row
- [x] K.3 SelectionBar horizontal scroll strip (single row, 48px max)
- [x] K.4 Compact BottomBar + fix double safe-area inset
- [x] K.5 BubbleField canvas maximization (reduced padding, bigger bubbles, top-align)
- [x] K.6 DimensionalField canvas maximization (aspect-square, overlay suggestions)
- [x] K.7 BodyMap canvas maximization + touch targets (hitD expand, label pills, mode toggle)
- [x] K.8 CrisisBanner positioning (above results) + helpline touch target
- [x] K.9 Technical debt reduction (CSS custom properties, breakpoint unification)
- [x] K.10 Comprehensive touch target audit (all interactive elements ≥ 44px)
- [x] K.11 Documentation & codemap updates

## Phase E: Advanced Features

- [ ] E.1 Quick check-in mode — 30-sec grid of 8-12 words
- [ ] E.2 Model progression & scaffolding
- [ ] E.3 Emotional granularity training
- [ ] E.5 Master combination model
- [ ] E.7 Chain analysis mode (DBT)
- [ ] E.8 Simple language mode

## Phase F: Architecture & Quality

- [ ] F.4 Lazy loading models — `React.lazy` + `Suspense`
- [ ] F.7 PWA improvements — offline indicator, install prompt

## Implementation Order

```
Phase K (mobile stabilization) ← CURRENT
  ↓
Phase E (advanced features)
  ↓
Phase F (architecture/quality)
```

## Completed

- [x] **Phase L** — Mobile UX Optimization
  - L.1: Bubble vertical distribution — even spacing across container height instead of top-packing
  - L.2: Body map label alternation — R/L/R/L pattern with anatomical pair constraints
  - L.3: SensationPicker 2-column grid — replaces horizontal scroll to eliminate anchoring bias
  - L.4: Dimensional field padding reduced (50→30) — 21% more area for emotion dots
  - L.5: Settings info button alignment — items-start for consistent first-line alignment
  - L.6: "Save sessions" toggle — localStorage-based opt-out with existing data cleanup prompt
  - L.7: Results window cleanup — selection chips, grouped suggestions, tighter spacing
- [x] **Phase J** — Mobile Layout & Settings Fix
  - J.1+J.2: SettingsMenu converted to fixed full-screen slide-in panel (escapes Header stacking context)
  - J.3: AnalyzeButton moved to bottom bar, "don't know" hidden on somatic, SelectionBar hidden when empty, hint floats inside visualization
  - J.4: SensationPicker compacted to horizontal scroll row with compact intensity variant
  - J.5: Slide-in animation, sticky close button, safe-area padding (included in J.1)
  - J.6: Custom event `emot-id:dismiss-picker` closes SensationPicker when settings opens
- [x] **Phase I** — Mobile UX Round 3
  - I.1: BubbleField deterministic layout already existed for <500px
  - I.3: ModelBar shortName at min-[480px] already worked
  - I.7: DimensionalField touch hit area increased r=24→32 (~46px at mobile scale), visible dots enlarged
  - I.11: No auto-dismiss existed (manual close only)
  - I.12: Both languages already said "body" not "system"
  - I.13: Reflection buttons already used identical neutral styling
  - I.14-I.15: Privacy framing and selection pressure already appropriate
