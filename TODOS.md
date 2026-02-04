# Emot-ID Improvement Plan

Multi-perspective review synthesized into a prioritized roadmap.

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
Phase E (advanced features) ← NEXT
  ↓
Phase F (architecture/quality)
```

## Completed

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
