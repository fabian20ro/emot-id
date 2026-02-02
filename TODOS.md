# Emot-ID Improvement Plan

Multi-perspective review synthesized into a prioritized roadmap.

## Phases A–D: Complete ✅

Safety, accessibility, navigation UX, psychological depth, session history — all done.

## Phase E: Advanced Features (Partial)

- [ ] E.1 Quick check-in mode — 30-sec grid of 8-12 words
- [ ] E.2 Model progression & scaffolding — suggested learning order (needs UI wiring)
- [ ] E.3 Emotional granularity training — distinction prompts after 10+ sessions
- [ ] E.5 Master combination model — cross-model aggregation (needs F.2)
- [ ] E.7 Chain analysis mode (DBT)
- [ ] E.8 Simple language mode

## Phase F: Architecture & Quality (Partial)

- [ ] F.4 Lazy loading models — `React.lazy` + `Suspense` per model
- [ ] F.6 E2E tests (Playwright) — happy path for each model
- [ ] F.7 PWA improvements — offline indicator, install prompt, update notification

## Phase G: Mobile UX Stabilization ✅

Comprehensive mobile usability audit + targeted fixes. No new features.

- [x] G.1 SelectionBar height & scrolling — increase `max-h-[12vh]` to `max-h-[20vh]`
- [x] G.2 Bubble minimum touch targets — add `min-h-[44px] min-w-[44px]`
- [x] G.3 DimensionalField touch precision — invisible hit circles (r=18) behind dots
- [x] G.4 SettingsMenu responsive width — `max-w-[calc(100vw-2rem)]`
- [x] G.5 Safe-area-inset for notched devices — `env(safe-area-inset-*)`
- [x] G.6 BodyMap label overlap on narrow screens — responsive font/offset
- [x] G.7 ResultModal height on short screens — increase to `max-h-[90vh]`

## Implementation Order

```
Phase G (mobile stabilization)  ← Done ✅
  ↓
Phase E (advanced features)
  ↓
Phase F (architecture/quality)
```
