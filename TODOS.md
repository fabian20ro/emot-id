# Emot-ID Improvement Plan

Multi-perspective review synthesized into a prioritized roadmap.

## Phase A: Safety, Accessibility & Polish ✅

- [x] A.1 Modal Accessibility — focus trapping, Escape key, focus return, aria-live region
- [x] A.2 Reduced Motion Support — `MotionConfig reducedMotion="user"` wrapper
- [x] A.3 Crisis Banner auto-expand grounding for tier 2/3
- [x] A.4 Somatic pause after high-intensity (intensity-3) selections in Guided Scan
- [x] A.5 Somatic numbness flooding detection (3+ body groups → grounding prompt)
- [x] A.6 Graduated exposure for high-distress results (collapsed by default)

## Phase B: Navigation & Interaction UX ✅

- [x] B.1 Model indicator & selector — visible model bar below header
- [x] B.2 Clear selections undo — 5-second undo toast
- [x] B.3 "Yes" reflection warm close — acknowledgment screen before dismiss
- [x] B.4 "I Don't Know" prominence — upgrade to styled button
- [x] B.5 SensationPicker swipe-to-dismiss — Framer Motion `drag="y"`
- [x] B.6 BubbleField overflow fix — guard grid fallback y-overflow + rAF debounce
- [x] B.7 Selection count on Analyze button — "Analyze (3)"
- [x] B.8 Haptic feedback on mobile — `navigator.vibrate(10)`

## Phase C: Psychological Depth ✅

- [x] C.1 Expand Somatic Model (21 → 30+ emotions) — loneliness, tenderness, contempt, jealousy, frustration, relief, gratitude, hope, curiosity
- [x] C.2 Add sensation type: Constriction — throat, chest, stomach with emotion signals
- [x] C.3 Bidirectional & valence-aware cross-model bridges — pleasant emotion savoring bridge
- [x] C.4 Post-identification micro-interventions — breathing, savoring, curiosity prompts (MicroIntervention.tsx)
- [x] C.5 Richer pleasant emotion synthesis — combination-specific narratives (joy+gratitude, love+trust, etc.)
- [x] C.6 Normalize the "I Don't Know" experience — psychoeducation in DontKnowModal
- [x] C.7 Standardize needs field phrasing — noun/state form across all data.json

## Phase D: Session History & Longitudinal Features ✅

- [x] D.1 Storage consolidation — `src/data/storage.ts`, centralized localStorage wrapper
- [x] D.2 Session history (IndexedDB) — `idb-keyval`, session repository, useSessionHistory hook, SessionHistory UI
- [x] D.3 Emotional vocabulary tracker — growth visualization with milestones
- [x] D.4 Temporal crisis pattern detection — escalate if 3+ tier 2/3 in 7 days
- [x] D.5 Somatic heat map over time — recurring region/sensation frequency bars
- [x] D.6 Positive emotion ratio awareness — weekly pleasant/unpleasant bar

## Phase E: Advanced Features (Partial)

- [ ] E.1 Quick check-in mode — 30-sec grid of 8-12 words
- [ ] E.2 Model progression & scaffolding — suggested learning order (needs UI wiring)
- [ ] E.3 Emotional granularity training — distinction prompts after 10+ sessions
- [x] E.4 Export for therapy — clipboard copy + `.txt` download in SessionHistory
- [ ] E.5 Master combination model — cross-model aggregation (needs F.2)
- [x] E.6 Opposite action nudges (DBT) — context-sensitive suggestions in ResultModal
- [ ] E.7 Chain analysis mode (DBT)
- [ ] E.8 Simple language mode

## Phase F: Architecture & Quality

- [x] F.1 Extract App.tsx state into hooks — useModelSelection, useHintState
- [x] F.2 Generic ModelState — `custom?: Record<string, unknown>` extension point
- [x] F.3 Type-safe i18n — `section()` accessor replacing unsafe casts
- [ ] F.4 Lazy loading models — `React.lazy` + `Suspense` per model
- [x] F.5 Integration tests — vocabulary, temporal-crisis, opposite-action, valence-ratio, export (23 new tests)
- [ ] F.6 E2E tests (Playwright) — happy path for each model
- [ ] F.7 PWA improvements — offline indicator, install prompt, update notification

## Implementation Order

```
Phase A (safety/a11y)     ← Done ✅
  ↓
Phase B (UX polish)       ← Done ✅
  ↓
Phase C (content/models)  ← Done ✅
  ↓
Phase F.1-F.3 (arch)      ← Done ✅
  ↓
Phase D (data layer)      ← Done ✅
  ↓
Phase E (advanced)        ← Partial (E.2, E.4, E.6 done)
  ↓
Phase F.4-F.7 (quality)   ← Partial (F.5 done)
```
