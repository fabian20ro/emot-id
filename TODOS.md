# Emot-ID Improvement Plan

Multi-perspective review synthesized into a prioritized roadmap.

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

## Phase H: Mobile UX Round 2 ✓ Complete

Targeted fixes from psychologist + architect review of live Chrome audit at 375x812 and 320x568.

### P0 — Critical

- [x] **H.1** Dimensional label overlap in calm quadrant
  - **Files:** `src/models/dimensional/data.json`, `src/components/DimensionalField.tsx`
  - **(A)** Nudged duplicate coordinates: lonely → `(-0.7, -0.35)`, resigned → `(-0.55, -0.55)`.
  - **(B)** Added greedy label collision avoidance pass (14px min gap, 40px x proximity).

- [x] **H.2** Plutchik bubbles off-screen at 320px
  - **File:** `src/components/BubbleField.tsx`
  - Clamped `x` in grid fallback: `Math.min(x, containerWidth - w - padding)`.

### P1 — High

- [x] **H.3** BodyMap no scroll affordance on short screens
  - **File:** `src/components/BodyMap.tsx`
  - Changed `min-h-[200px]` → `min-h-0 overflow-hidden`. SVG scales via viewBox.

- [x] **H.4** ModelBar cramped at 320px
  - **Files:** `src/models/types.ts`, model registrations, `src/components/ModelBar.tsx`
  - Added `shortName` to model type. Below 360px, renders short names via Tailwind `min-[360px]:` variant.

### P2 — Low

- [x] **H.5** Hint and "I don't know" button redundancy
  - **File:** `src/App.tsx`
  - Hidden "I don't know" while hint visible: `selections.length === 0 && !showHint`.

- [x] **H.6** Privacy notice — session data stays on device
  - **Files:** `src/components/SettingsMenu.tsx`, `src/i18n/en.json`, `src/i18n/ro.json`
  - Two-tier approach: visible headline "Your data stays on this device" + InfoButton with full privacy details.
  - **Psych:** Users exploring vulnerable emotional states need trust that their data is private. Explicit reassurance reduces inhibition and encourages honest self-exploration.

- [x] **H.7** Reusable InfoButton component
  - **Files:** `src/components/InfoButton.tsx`, `src/__tests__/InfoButton.test.tsx`
  - Self-contained ⓘ icon → portal modal with focus trap, `aria-modal`, `aria-labelledby`.

- [x] **H.8** Replace disclaimer `<details>` in SettingsMenu
  - **File:** `src/components/SettingsMenu.tsx`
  - Replaced `<details>` with InfoButton for better mobile discoverability.

- [x] **H.9** Replace description `<details>` in ResultCard
  - **File:** `src/components/ResultCard.tsx`, `src/__tests__/ResultCard.test.tsx`
  - Collapsed descriptions use InfoButton modal; expanded descriptions render inline.

## Implementation Order

```
Phase H (mobile UX round 2)     ✓ Complete (H.1–H.9)
  ↓
Phase E (advanced features)
  ↓
Phase F (architecture/quality)
```
