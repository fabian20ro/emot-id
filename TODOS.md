# Emot-ID Improvement Plan

Multi-perspective review synthesized into a prioritized roadmap.

## Phase J: Mobile Layout & Settings Fix (CURRENT)

Two critical issues visible on iPhone 14 (390×844):
1. **Settings menu is unusable** — clips content, backdrop doesn't block UI, z-index broken
2. **Body map overflows viewport** — legs cut off, sensation picker covers the entire body

### Vertical space budget (iPhone 14, 390×844)

```
Status bar              ~50px
Header                  ~56px
ModelBar                ~44px
Hint / AnalyzeButton    ~46px
"Nu stiu ce simt"       ~52px  (hidden after first selection)
SelectionBar            ~50px
Mode toggle (in BodyMap) ~36px
─────────────────────────────
Total consumed          ~334px
Available for body SVG  ~460px  (but SVG viewBox is 200×440 + labels need ~80px extra)
SensationPicker         ~350px  (when open, leaves ~110px for body = unusable)
```

### P0 — Critical

- [ ] **J.1** Settings menu clips content — disclaimer/privacy/crisis invisible
  - **File:** `src/components/SettingsMenu.tsx`
  - **Root cause:** Menu panel is `position: absolute; overflow-hidden` inside Header's `relative` container. Content (language + 4 model cards + sound + history + crisis + privacy + disclaimer) exceeds viewport height. `overflow-hidden` clips the bottom.
  - **Fix:** Convert to full-screen fixed panel with `overflow-y-auto`. Use `fixed inset-x-0 top-0 bottom-0 z-[var(--z-modal)]` (same pattern as SessionHistory). Slide-in from left with Framer Motion.

- [ ] **J.2** Settings backdrop doesn't block underlying UI
  - **Files:** `src/components/SettingsMenu.tsx`, `src/components/Header.tsx`
  - **Root cause:** Menu panel is `absolute z-[var(--z-modal)]` (z-40) but trapped inside Header's `z-[var(--z-header)]` (z-10) stacking context. Other `fixed` elements (SensationPicker, body map) paint outside the Header context, appearing above the backdrop.
  - **Fix:** Solved by J.1 — converting menu to `fixed` positioning escapes the Header stacking context. Both backdrop (`z-[var(--z-backdrop)]`) and panel (`z-[var(--z-modal)]`) become viewport-relative.

- [ ] **J.3** Body map legs/feet cut off in viewport
  - **Files:** `src/components/BodyMap.tsx`, `src/App.tsx`
  - **Root cause:** ~334px consumed above body map leaves ~460px for the SVG on iPhone 14. The SVG viewBox (200×440) plus external labels (~80px below lowest path) requires ~520px minimum. Legs ("Picioare") are always off-screen.
  - **Fix — reduce vertical space above body:**
    - (a) Move AnalyzeButton into a fixed bottom bar or float it over the body map (saves ~46px)
    - (b) Collapse hint text into the visualization area instead of stacking above it
    - (c) Hide "Nu stiu ce simt" button on somatic model (it's redundant — guided scan already covers that use case) (saves ~52px)
    - (d) Make SelectionBar collapsible — show chip count instead of full strip when empty (saves ~20px)
  - **Goal:** Get total consumed to ~240px, leaving ~554px for body + labels.

- [ ] **J.4** SensationPicker covers entire body — can't see selected region
  - **Files:** `src/components/SensationPicker.tsx`, `src/components/BodyMap.tsx`
  - **Root cause:** Picker is a bottom sheet (`fixed bottom-0`) ~350px tall. With only ~460px for the body, the picker covers 75% of it. User taps a region but can't see which one because the picker obscures it.
  - **Fix — make picker more compact or contextual:**
    - (a) Reduce picker height: use compact 1-row horizontal scroll for sensations instead of 2-column grid (saves ~150px)
    - (b) Show selected region name prominently in picker header (already done) + highlight the region on the body map behind the picker (body scrolls/repositions so tapped region is visible above picker)
    - (c) Alternative: inline the picker next to the tapped region as a popover instead of bottom sheet (complex but ideal)
  - **Minimum:** Option (a) — compact horizontal layout reduces picker from ~350px to ~180px.

### P1 — High

- [ ] **J.5** Settings panel UX polish
  - After converting to full-screen panel:
    - Slide-in animation from left (Framer Motion `x: "-100%"` → `x: 0`)
    - Close button (×) at top-right, sticky
    - Grouped sections with spacing
    - Safe-area padding for notched devices (`pb-[env(safe-area-inset-bottom)]`)

- [ ] **J.6** Dismiss SensationPicker when settings menu opens
  - **Files:** `src/components/BodyMap.tsx`, `src/App.tsx`
  - When both are open, they compete at same z-level. Simplest fix: close active picker (reset `activeRegionId`) when settings opens.

## Phase I: Mobile UX Round 3 (remaining items)

### P0 — Critical

- [ ] **I.1** BubbleField overlap and viewport escape at 390px
  - **File:** `src/components/BubbleField.tsx`
  - Bubbles overlap and escape viewport. Random placement fails at 390px.
  - **Fix:** Deterministic grid/radial layout on mobile (<480px). Measure actual bubble DOM widths.

### P1 — High

- [ ] **I.3** ModelBar shows full names at 390px — truncates "Body Ma..."
  - **File:** `src/components/ModelBar.tsx`
  - Breakpoint `min-[360px]` too low. Already fixed to `min-[480px]` — verify on device.

- [ ] **I.7** Dimensional model dots too small to tap on mobile
  - **File:** `src/components/DimensionalField.tsx`
  - Dots below 44px touch target. Increase or add two-step interaction.

### P2 — Medium

- [ ] **I.11** Warm close auto-dismiss too fast (3 seconds)
  - **File:** `src/components/ResultModal.tsx`
  - Extend to 5-6s, or remove auto-dismiss.

- [ ] **I.12** Onboarding "system" wording
  - "what is my system telling me?" → "what is my body telling me?"

- [ ] **I.13** Reflection button colors imply judgment hierarchy
  - Use neutral indigo/gray for all three.

### P3 — Low

- [ ] **I.14** Privacy modal framing
- [ ] **I.15** "the most" selection pressure

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
Phase J (settings menu + body map layout) ← CURRENT PRIORITY
  J.1-J.2: Settings → full-screen panel (fixes clip + backdrop)
  J.3-J.4: Body map vertical space + compact picker
  J.5-J.6: Polish
  ↓
Phase I (remaining mobile UX)
  ↓
Phase E (advanced features)
  ↓
Phase F (architecture/quality)
```
