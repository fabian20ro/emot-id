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

## Phase H: Mobile UX Round 2 ← Active

Targeted fixes from psychologist + architect review of live Chrome audit at 375x812 and 320x568.

### P0 — Critical

- [ ] **H.1** Dimensional label overlap in calm quadrant
  - **Files:** `src/models/dimensional/data.json`, `src/components/DimensionalField.tsx`
  - **(A) Data: nudge duplicate coordinates.** "sad" and "lonely" both at `(-0.6, -0.4)`; "gloomy" and "resigned" both at `(-0.5, -0.5)`. Shift lonely → `(-0.7, -0.35)`, resigned → `(-0.55, -0.55)`. Preserves quadrant membership and semantic distance.
  - **(B) Render: label collision avoidance.** After computing label y-positions, greedy pass that bumps overlapping labels (within ~14px at similar x) by ±12px on y-axis.
  - **Psych:** Unpleasant-calm quadrant is where distressed users look first. Overlapping labels make those emotions unreachable.

- [ ] **H.2** Plutchik bubbles off-screen at 320px
  - **File:** `src/components/BubbleField.tsx` (line ~57)
  - Clamp `x` in grid fallback: `x = Math.min(x, availableWidth - w - padding)`. One-line fix.
  - **Psych:** Hidden emotion options cause disengagement — users conclude "this tool doesn't have what I feel."

### P1 — High

- [ ] **H.3** BodyMap no scroll affordance on short screens
  - **File:** `src/components/BodyMap.tsx` (line ~133)
  - Change `min-h-[200px]` → `min-h-0` + `overflow-hidden`. SVG scales down via viewBox.
  - **Psych:** On 568px height, legs/feet hidden below fold — blocks somatic pathway for shame, guilt, restlessness.

- [ ] **H.4** ModelBar cramped at 320px
  - **Files:** `src/models/types.ts`, model registrations, `src/components/ModelBar.tsx`
  - Add optional `shortName` to model type. Below 360px, render short names ("Plutchik", "Wheel", "Body", "Space").
  - **Psych:** Cramped tabs discourage model switching, effectively locking users into first model.

### P2 — Low

- [ ] **H.5** Hint and "I don't know" button redundancy
  - **File:** `src/App.tsx` (line ~183)
  - Hide "I don't know" while hint visible: `selections.length === 0 && !showHint`. Saves ~50px vertical.
  - **Psych:** Both elements compete for vertical space on first visit. Hint is more important for orientation.

- [ ] **H.6** Privacy notice — session data stays on device
  - **Files:** Onboarding component or SettingsMenu disclaimer section
  - Add a visible message explaining that all session data (emotion selections, history, somatic maps) is stored locally in IndexedDB/localStorage and never leaves the device. No server, no analytics, no cloud sync.
  - **Psych:** Users exploring vulnerable emotional states need trust that their data is private. Explicit reassurance reduces inhibition and encourages honest self-exploration.

## Implementation Order

```
Phase H (mobile UX round 2)     ← Next: H.2 → H.5 → H.3 → H.4 → H.1
  ↓
Phase E (advanced features)
  ↓
Phase F (architecture/quality)
```
