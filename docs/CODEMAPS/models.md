# Emotion Models Codemap

**Last Updated:** 2026-02-26
**Location:** `src/models/`

## Type Hierarchy

```
BaseEmotion { id, label, description?, needs?, color, intensity? }
  |
  +-- PlutchikEmotion  { category, intensity, opposite?, spawns[], components? }
  +-- WheelEmotion     { level, parent?, children? }
  +-- SomaticRegion    { svgRegionId, group, commonSensations[], emotionSignals[] }
  |    |
  |    +-- SomaticSelection  { selectedSensation, selectedIntensity }  (runtime enrichment)
  +-- DimensionalEmotion  { valence, arousal, quadrant }
```

## Model Concepts

| Model | Concept | Visualization |
|-------|---------|---------------|
| **Plutchik** | 8 primaries spawn related emotions; selected pairs combine into dyads | BubbleField |
| **Wheel** | 3-level hierarchical tree; drill down from general to specific | BubbleField |
| **Somatic** | Identify emotions through physical body sensations; weighted signal scoring | BodyMap |
| **Dimensional** | 2D valence × arousal field; click-to-place finds nearest emotions | DimensionalField |

## Non-Obvious Design Decisions

### Somatic Scoring Nuances

The coherence bonus rewards cross-body-group consistency (multi-region patterns score higher than single-region). Match strength labeling uses both ratio-to-top-scorer AND absolute score floors — high ratio alone isn't enough for "clear signal" if the absolute score is low.

### Constriction as Distinct Sensation

Constriction is separate from tension (held muscular effort) and pressure (external force). Constriction = tightening/narrowing, common in throat, chest, stomach during anxiety/shame/grief. Added as the 9th sensation type.

### Numbness Flooding Detection

When numbness is reported across 3+ body groups, the somatic model offers a grounding prompt. This is a safety feature, not just pattern detection.

### Dimensional Quadrant Sparsity Fix

Extra unpleasant-calm emotions were added to reduce quadrant sparsity. `lonely` and `resigned` coordinates were adjusted to reduce overlap in that quadrant.

### Planned Models

Ekman facial, Parrott hierarchy, contrasting pairs, image-based wheel, master combination. See `registry.ts` for the extension pattern.

## Related Codemaps

- [Architecture](architecture.md) — Registry wiring, state management, data flow
- [Frontend](frontend.md) — Visualization components that render model data
