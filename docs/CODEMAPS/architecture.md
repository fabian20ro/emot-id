# Architecture Codemap

**Last Updated:** 2026-02-26

## Component Tree

```
main.tsx → StrictMode > LanguageProvider > App
                                           |
       +--------+------------+-------------+-------------+---------------+------------+--------------+--------------+--------------+
       |        |            |             |             |               |            |              |              |              |
     Header  SettingsMenu*  SelectionBar  AnalyzeButton  Visualization**  ResultModal  DontKnowModal  UndoToast  SessionHistory  ChainAnalysis
         |  |         |
 MenuButton ModelBar  InfoButton[]
```

`*` SettingsMenu renders via `createPortal(…, document.body)` — a sibling of the main layout div, not a child of Header.

`**` Visualization is resolved at runtime from the model registry.

## Non-Obvious Patterns

### Somatic Deselect Routing

BodyMap intercepts the deselect path. When a selected region is clicked, it calls `onDeselect(enrichedSelection)` with the `SomaticSelection` from its selection map, not `onSelect(plainRegion)`.

### Portal Requirement for Fixed Overlays

All `position: fixed` overlays must use `createPortal(content, document.body)` to escape parent stacking contexts. WebKit's `backdrop-filter` creates new stacking contexts that trap z-indexed children — this was the root cause of the Phase K stabilization where SettingsMenu rendered but was invisible behind content.

Currently portaled to body: **SettingsMenu**, **InfoButton**. Other overlays use `ModalShell` which handles layering internally.

### Graduated Crisis Access

Tier1-3 show crisis banner alongside all features (AI link, opposite action, micro-interventions). Only tier4 pre-acknowledgment gates features behind an acknowledgment wall. Do not reintroduce binary suppression — the graduated model is intentional.

### Model Loading Strategy

Plutchik, Wheel, and Dimensional are eagerly loaded into the model cache at module time. Somatic (the default model) is the only lazy-loaded model — first render requires an async import.

## Related Codemaps

- [Frontend Components](frontend.md)
- [Emotion Models](models.md)
