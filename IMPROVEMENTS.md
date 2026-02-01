# Future Improvements

Deferred recommendations from psychologist and architect analysis.

## 1. Somatic / Functional Entry Prompts

Body-first emotion identification flow based on Damasio's somatic marker hypothesis. Instead of starting with emotion labels, prompt users with body sensations ("Where do you feel tension?", "Is your chest tight or open?") and map those to emotions.

**Rationale:** Many people struggle to name emotions directly but can identify physical sensations. This approach bridges the body-mind gap and helps users who are alexithymic or emotionally disconnected.

**Implementation notes:**
- New model type with body-map visualization
- Sensation-to-emotion mapping data
- Could serve as an entry point before other models

## 2. Emotional Profile Synthesis

Rule-based narrative interpretation of multi-emotion combinations. When a user selects multiple emotions, generate an adaptive message that considers:
- Valence balance (ratio of positive to negative emotions)
- Intensity patterns (all high, all low, mixed)
- Emotional complexity (emotions from different families)
- Adaptive framing (normalize the experience, suggest coping)

**Rationale:** Raw emotion labels alone don't help users understand *what it means* to feel a specific combination. A brief interpretive narrative validates the experience and offers perspective.

**Implementation notes:**
- Rule engine in `analyze()` output (no AI/LLM needed)
- Add `synthesis` field to `AnalysisResult`
- Display as a summary card in `ResultModal`

## 3. Russell's Circumplex Model

2D valence-arousal dimensional model as an alternative to categorical approaches. Emotions are plotted on a scatter chart with:
- X-axis: valence (unpleasant to pleasant)
- Y-axis: arousal (deactivated to activated)

**Rationale:** The circumplex model captures nuance that categorical models miss — it shows that "calm" and "happy" differ primarily in arousal, not valence. It's widely used in affective science research.

**Implementation notes:**
- Custom scatter-plot visualization component (not BubbleField)
- Leverages the visualization registry (Phase 4) for model-specific views
- Users tap regions of the 2D space to identify their emotional state
- Could overlay labels from other models for cross-referencing
