# Emot-ID Improvement Plan

Multi-perspective review synthesized into a prioritized roadmap.

## Phase I: Mobile UX Round 3 + Safety

Findings from psychologist, UX expert, and architect audit at iPhone 14 (390x844) using Playwright-emulated screenshots and automated interaction testing.

### P0 — Critical

- [ ] **I.1** BubbleField overlap and viewport escape at 390px
  - **File:** `src/components/BubbleField.tsx`
  - Bubbles overlap (Happy intercepted by Angry) and escape viewport after selection (Fearful outside screen). Random placement algorithm fails at 390px: 8 bubbles averaging 100px each need ~800px total but only 358px available.
  - **Fix:** Replace random scatter with deterministic grid or radial layout on mobile (<480px). Measure actual bubble DOM widths instead of hardcoded `sizePixels`. Re-run collision detection (not just clamping) when container resizes.

- [ ] **I.2** Onboarding overlay is semi-transparent — UI bleeds through
  - **Files:** `src/components/Onboarding.tsx`, `src/App.tsx`
  - Body Map labels, ModelBar tabs, and SelectionBar text visible behind onboarding at 95% opacity. OLED displays amplify the bleed.
  - **Fix:** Use early return in App.tsx: if `showOnboarding`, render only `<Onboarding>` and skip mounting the entire app. Eliminates bleed-through and saves unnecessary hook/render cycles.

### P1 — High

- [ ] **I.3** ModelBar shows full names at 390px — truncates "Body Ma..."
  - **File:** `src/components/ModelBar.tsx`
  - Breakpoint `min-[360px]` is too low — at 390px full names are shown but overflow. "Body Ma..." is truncated.
  - **Fix:** Raise breakpoint to `min-[480px]` or `sm` (640px). Show short names by default on all phones. Add scroll fade indicator on right edge.

- [ ] **I.4** Settings menu backdrop is transparent — content bleeds through
  - **File:** `src/components/SettingsMenu.tsx`
  - Backdrop div `z-40` has no background color; right 102px of screen shows full app content.
  - **Fix:** Add `bg-black/60 backdrop-blur-sm` to backdrop. Consider full-screen slide-in panel on mobile.

- [ ] **I.5** No crisis resources accessible before completing a flow
  - **Files:** `src/components/SettingsMenu.tsx`, `src/i18n/en.json`, `src/i18n/ro.json`
  - Crisis banner only appears in ResultModal after analysis. Users in acute distress who cannot navigate the interface never see help.
  - **Fix:** Add persistent subtle crisis resource link in settings menu or as header icon. Include specific crisis line (116 123 Romania, findahelpline.com).
  - **Psych:** Users in distress need help before completing an interaction flow, not after.

- [ ] **I.6** Onboarding disclaimer lacks concrete crisis contact
  - **Files:** `src/components/Onboarding.tsx`, `src/i18n/en.json`, `src/i18n/ro.json`
  - Screen 4 says "reach out to a qualified professional" but gives no number, link, or next step.
  - **Fix:** Add "Call 116 123 (Romania, free, 24/7) or visit findahelpline.com" directly on this screen.

- [ ] **I.7** Dimensional model dots too small to tap on mobile
  - **File:** `src/components/DimensionalField.tsx`
  - Dots are below 44x44px minimum touch target on 390px screen. Labels overlap densely.
  - **Fix:** Increase touch target to 44px minimum. Consider two-step interaction: tap quadrant first, then see enlarged options within that region.

- [ ] **I.8** "I don't know" button below 44px touch target
  - **File:** `src/App.tsx` (line 183-189)
  - Button uses `py-1.5` = ~36px height. Critical entry point for uncertain users.
  - **Fix:** Increase to `py-2.5` or `min-h-[44px]`. Increase font from `text-sm` to `text-base`.

### P2 — Medium

- [ ] **I.9** Z-index stacking conflicts
  - **Files:** `src/components/Header.tsx`, `src/components/SettingsMenu.tsx`, `src/components/Onboarding.tsx`
  - Header, settings panel, and onboarding all share `z-50`. Settings backdrop is `z-40` (below header). Stacking depends on DOM order.
  - **Fix:** Define explicit z-index scale: header=10, dropdown=20, backdrop=30, modal=40, toast=50. Apply consistently.

- [ ] **I.10** Body Map SVG labels too small (fontSize 7)
  - **File:** `src/components/BodyMap.tsx`
  - SVG text labels use `fontSize={7}` — too small for mobile readability. Arrow lines at `strokeWidth={1}` are faint.
  - **Fix:** Increase fontSize to 9-10. Increase strokeWidth to 1.5.

- [ ] **I.11** Warm close auto-dismiss too fast (3 seconds)
  - **File:** `src/components/ResultModal.tsx`
  - "Take a moment with this. Your feelings are valid" auto-dismisses after 3 seconds. The message asks the user to pause, then removes the pause.
  - **Fix:** Extend to 5-6 seconds, or remove auto-dismiss and let user close manually.
  - **Psych:** Emotional validation needs time to land. Rushing dismissal contradicts the message.

- [ ] **I.12** Onboarding "system" wording may confuse non-clinical users
  - **Files:** `src/i18n/en.json`, `src/i18n/ro.json`
  - Screen 2: "what is my system telling me?" uses polyvagal language unfamiliar to most users.
  - **Fix:** Change to "what is my body telling me?" or "what might this feeling be signaling?"

- [ ] **I.13** Reflection button colors imply judgment hierarchy
  - **File:** `src/components/ResultModal.tsx`
  - Green=Yes, amber=Partly, gray=No creates implicit correctness ranking.
  - **Fix:** Use same neutral color (indigo/gray palette) for all three buttons.

### P3 — Low

- [ ] **I.14** Privacy modal could frame choice in emotional safety terms
  - **Files:** `src/i18n/en.json`, `src/i18n/ro.json`
  - Add: "We believe your emotional life is deeply personal, so we designed Emot-ID to keep everything on your device."

- [ ] **I.15** Instruction text "the most" adds selection pressure
  - **Files:** `src/i18n/en.json`, `src/i18n/ro.json`
  - "Select an emotion that resonates with you the most right now" → drop "the most" to reduce perfectionism pressure.

## Phase E: Advanced Features (Partial)

- [ ] E.1 Quick check-in mode — 30-sec grid of 8-12 words
- [ ] E.2 Model progression & scaffolding — suggested learning order (needs UI wiring)
- [ ] E.3 Emotional granularity training — distinction prompts after 10+ sessions
- [ ] E.5 Master combination model — cross-model aggregation (needs F.2)
- [ ] E.7 Chain analysis mode (DBT)
- [ ] E.8 Simple language mode

## Phase F: Architecture & Quality (Partial)

- [ ] F.4 Lazy loading models — `React.lazy` + `Suspense` per model
- [x] F.6 E2E tests (Playwright) — smoke tests for each model ✓
- [ ] F.7 PWA improvements — offline indicator, install prompt, update notification

## Phase H: Mobile UX Round 2 ✓ Complete

Targeted fixes from psychologist + architect review at 375x812 and 320x568. All 9 items implemented.

## Implementation Order

```
Phase I (mobile UX round 3 + safety)
  ↓
Phase E (advanced features)
  ↓
Phase F (architecture/quality)
```
