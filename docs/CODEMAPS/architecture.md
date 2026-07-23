# Architecture Codemap

**Last Updated:** 2026-07-24

## Component Tree

```
main.tsx -> StrictMode > LanguageProvider > App
                                             |
              AppShell -> active screen selected by useAppNavigation
                 |
     Today / Arrival / Check-in / Reflection / Explore / Journal
       / Session detail / Settings / Privacy / Support / Practice
```

Check-in rendering is split by route: affect and Plutchik share
`ModelCheckInScreen`; words use `WordLadderScreen`; body uses
`BodyCompassScreen`. Visualizations are resolved from the model registry.

## Non-Obvious Patterns

### Somatic Route Boundary

`BodyRegionMap` is presentation-only and hands a complete `SomaticRegion` to
`BodyCompassScreen`. The screen owns side, sensation, intensity, review, edit,
and removal state, then sends enriched `SomaticSelection` objects through the
shared model analyzer. Somatic is intentionally not registered as a generic
`ModelVisualization`.

### Portal Requirement for Fixed Overlays

All `position: fixed` overlays must use `createPortal(content, document.body)` to escape parent stacking contexts. WebKit's `backdrop-filter` creates new stacking contexts that can trap z-indexed children behind content.

Active fixed dialogs use `ModalShell`, which portals to `document.body` and
provides focus trapping. Migrated workflows render as screens, not dialogs.

### Graduated Crisis Access

Tier1-3 show crisis support alongside the reflection workflow. Only tier4
pre-acknowledgment gates the rest of reflection behind an acknowledgment wall.
Do not reintroduce binary suppression; the graduated model is intentional.
Playwright exercises this shared boundary through Quick, Body, Affect, Words,
and Plutchik completion rather than testing only one route.

### Model Loading Strategy

Plutchik, Wheel, and Dimensional are eagerly loaded into the model cache at module time. Somatic (the default model) is the only lazy-loaded model — first render requires an async import.

## Related Codemaps

- [Frontend Components](frontend.md)
- [Emotion Models](models.md)
