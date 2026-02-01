# Architecture Codemap

> Freshness: 2026-02-01

## Overview

Single-page PWA for interactive emotion identification. Plugin-based model system allows multiple emotion classification frameworks (Plutchik, Emotion Wheel, planned: Ekman, Parrott, axes).

## Entry Flow

```
main.tsx → LanguageProvider → App
```

## App Component Tree

```
App                          # root state: modelId, selections, analysisResults, isModalOpen
├── Header                   # app title + menu trigger (local: menuOpen)
│   ├── MenuButton           # hamburger icon with animated bars
│   └── SettingsMenu         # model/language switcher, closes on selection
├── AnalyzeButton            # triggers analyze(), opens modal
├── SelectionBar             # selected emotion chips + combo dyads
├── BubbleField              # physics-like bubble layout (local: containerSize, positions)
│   └── Bubble[]             # individual clickable emotion bubbles
└── ResultModal              # analysis results + Google AI search link
```

## State Architecture

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| App state | `useState` + `useCallback` | modelId, modal, analysisResults |
| Model state | `useEmotionModel` hook | selections, visibleEmotions, sizes, combos |
| Language | `LanguageContext` + `useLanguage` | language code, translation strings |
| Layout | `ResizeObserver` in BubbleField | container dimensions, bubble positions |

## Key Data Flow

```
Bubble click → App.handleSelect → useEmotionModel.handleSelect
  → model.onSelect(emotion, state, selections)
  → returns SelectionEffect { newState, newSelections? }
  → updates visibleEmotions + selections
  → SelectionBar re-renders, combos recalculated
```

## Plugin System

```
models/types.ts         # EmotionModel<E> interface, BaseEmotion, SelectionEffect
models/registry.ts      # model registry, getModel(), getAvailableModels()
models/plutchik/        # Plutchik wheel (49 emotions, spawns + dyads)
models/wheel/           # Emotion Wheel (3-level tree, drill-down)
```

## Cross-Cutting Concerns

| Concern | Implementation |
|---------|---------------|
| i18n | LanguageContext (ro/en), emotion labels inline in data.json |
| Animation | Framer Motion (spring physics, AnimatePresence, layout) |
| Sound | useSound hook (Web Audio API oscillator tones) |
| Storage | localStorage for language preference |
| PWA | vite-plugin-pwa, service worker |

## File Count Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| src/components/ | 8 | All UI components (flat) |
| src/models/ | 8 | Plugin system + 2 models |
| src/hooks/ | 3 | useEmotionModel, useLocalStorage, useSound |
| src/context/ | 2 | Language, Theme |
| src/i18n/ | 2 | ro.json, en.json |
| src/data/ | 1 | Legacy emotions.json |
| src/__tests__/ | 5 | 4 test files + setup |
