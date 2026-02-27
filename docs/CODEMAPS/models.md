# Emotion Models Codemap

**Last Updated:** 2026-02-27
**Location:** `src/models/`

## Architecture: Catalog + Overlays

All emotions have one canonical entry in `src/models/catalog/*.json` (id, label, description, needs, color, distressTier). Each model adds only model-specific metadata in overlay files. At module load, each model's `index.ts` merges catalog base + overlay into fully hydrated model-specific types.

```
catalog/*.json  →  Single source of truth for every emotion
    ↓
model/index.ts  →  getCanonicalEmotion(id) + overlay → hydrated ModelEmotion
```

## Type Hierarchy

```
BaseEmotion { id, label, description?, needs?, color, intensity? }
  |
  +-- PlutchikEmotion  { category, intensity, opposite?, spawns[], components? }
  +-- WheelEmotion     { level, parents[], children? }
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

### Catalog is the single source of truth

`distress.ts` derives HIGH_DISTRESS_IDS from catalog entries with `distressTier: 'high'` (no hardcoded sets). QuickCheckIn resolves directly from catalog (no model scanning).

### Model overlay colors override canonical colors

The canonical color is used for cross-model contexts (Quick Check-in, session history). Each model overlay provides its own color for model-specific visualizations.

### Somatic `contextDescription` is not duplication

Somatic signals have an optional `contextDescription` that provides body-region-specific framing ("Pressure or heat in the head, associated with anger"). This is distinct from the canonical description and is NOT a duplicate. Scoring.ts resolves `contextDescription ?? canonical.description` at runtime.

### Wheel multi-parent (`parents: string[]`)

Emotions like `embarrassed` appear under multiple L1 branches (both `hurt` and `disapproving`). The overlay uses `parents: string[]` instead of `parent: string`. The `analyze()` method walks `parents[0]` for the hierarchy path. Future: track actual drill-down path via `ModelState.custom.navPath`.

### Suffix dedup

Old suffixed IDs (`embarrassed_sad`, `embarrassed_disg`, `inferior_fear`, etc.) were collapsed into single canonical entries with multiple parents. Level-mismatched pairs (`overwhelmed` L1 vs `overwhelmed_bad` L2, `disappointed_disg` L1 vs `disappointed_sad` L2) remain separate because they serve different structural roles.

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
