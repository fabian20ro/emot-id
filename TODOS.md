# TODOS

Unimplemented features and deferred items from the comprehensive improvement plan (Phases 1-4 complete, Phase 5 planned only).

## Phase 5: Future Features

### 5.1 Quick Check-In Mode
- 30-second path: grid of 8-12 emotion words, tap 1-3, brief synthesis
- Personalized word selection based on session history
- New component (~200 lines)

### 5.2 Session History + Personal Vocabulary
- IndexedDB via `idb-keyval` for session persistence
- Emotion vocabulary growth tracking over time
- "Clear all data" button + JSON export for privacy compliance
- ~400 lines, prerequisite for 5.5 and 5.6

### 5.3 Master Combination Model
- Aggregator pattern (NOT an EmotionModel — different interface)
- Emotion equivalence mapping between models (e.g., Plutchik's "anger" = Wheel's "angry")
- SessionContext for multi-model results within a session
- Convergence/divergence analysis across models
- ~500 lines

### 5.4 Model Progression Labels
- Suggested learning order in settings: Somatic -> Dimensional -> Wheel -> Plutchik
- Brief explanation of why this order supports emotional literacy growth
- ~30 lines

### 5.5 Emotional Granularity Training
- After 10+ sessions, distinction prompts for similar emotions (e.g., "How is this different from frustration?")
- Depends on 5.2 (session history)

### 5.6 Export for Therapy
- Clipboard copy of session summary in structured format
- "Share with your therapist" framing — non-clinical, empowering tone
- Depends on 5.2 (session history)

## Deferred Items

### 3.6 Standardize Needs Field Phrasing
- Audit all `data.json` files across models
- Normalize phrasing to noun/state form ("safety and validation") rather than imperatives ("be safe")
- Low priority, cosmetic consistency improvement

### Architecture Decisions Deferred
- **Generic ModelState**: Currently each model uses the same `ModelState` shape. Future models may need custom state (e.g., image overlay coordinates). Consider making `ModelState` generic when adding non-standard models.
- **Lazy Loading**: Visualization components could be lazy-loaded per model to reduce initial bundle (~612KB currently). Consider `React.lazy()` + `Suspense` when bundle grows past 800KB.
- **Co-located Visualization Components**: Currently all components are flat in `components/`. As model count grows, consider co-locating visualization components within their model directories (e.g., `models/somatic/BodyMap.tsx`).

### Psychology Agent Recommendations (Deferred)
- **Emotion journaling prompts**: After results, offer a brief reflection prompt ("What situation triggered this?")
- **Normalization messaging**: Add "All emotions are valid" messaging throughout the app, not just in crisis moments
- **Cultural sensitivity**: Review emotion labels and descriptions for cultural bias; consider regional variants beyond RO/EN
- **Accessibility audit**: Screen reader support for BodyMap SVG regions, keyboard navigation for BubbleField
- **Guided breathing**: Full 4-7-8 breathing animation as a coping tool (currently only 5-4-3-2-1 grounding is included)
