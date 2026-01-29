# Emot-ID

Interactive emotion identification PWA. Currently implements Plutchik's wheel of emotions; expanding to multiple emotion classification models.

## Tech Stack

- React 19 + TypeScript 5.9, Vite 7, Tailwind CSS 4, Framer Motion 12
- PWA via `vite-plugin-pwa`, deployed to GitHub Pages at `/emot-id/`
- Testing: Vitest + Testing Library + jsdom

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build` |
| `npm test` | `vitest run` |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/        # All UI components (flat)
│   ├── Bubble.tsx          # Single emotion bubble + Emotion interface
│   ├── BubbleField.tsx     # Physics-like bubble layout
│   ├── SelectionBar.tsx    # Selected emotions strip
│   ├── Header.tsx          # App header
│   ├── MenuButton.tsx      # Hamburger menu trigger
│   ├── SettingsMenu.tsx    # Settings panel
│   ├── AnalyzeButton.tsx   # Triggers emotion analysis
│   └── ResultModal.tsx     # Analysis result display
├── context/
│   ├── LanguageContext.tsx  # i18n provider (ro/en, persisted to localStorage)
│   └── ThemeContext.tsx     # Dark theme only (currently)
├── hooks/
│   ├── useLocalStorage.ts  # Generic localStorage hook
│   └── useSound.ts         # Web Audio API tones (select/deselect)
├── data/
│   └── emotions.json       # 49 Plutchik emotions
├── i18n/
│   ├── ro.json             # Romanian (default)
│   └── en.json             # English
├── __tests__/              # Vitest tests
├── App.tsx                 # Root component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Architecture

### Core Emotion Interface (in `Bubble.tsx`)

```typescript
interface Emotion {
  id: string
  label: { ro: string; en: string }
  category: string          // "primary" | "intensity" | "dyad" | "secondary_dyad" | "tertiary_dyad" | "opposite_dyad"
  color: string             // hex color
  intensity: number         // 0.3–0.8
  opposite?: string         // opposite emotion id
  spawns: string[]          // emotions revealed on selection
  components?: string[]     // two emotion ids that combine into this dyad
}
```

### How It Works

- **BubbleField** renders emotion bubbles with physics-like positioning
- Selecting a bubble spawns related emotions (via `spawns` array)
- Dyads are detected from `components` — two selected primaries reveal their dyad
- **SelectionBar** shows current picks; **AnalyzeButton** triggers result analysis
- State lives in component state + Context API. No router, no backend.
- Bilingual: Romanian default, browser-detected. Emotion labels are inline (`label.ro`/`label.en`), UI strings in `i18n/*.json`

## Multi-Model Expansion Direction

### Planned Models

| Model | Data Shape | Status |
|-------|-----------|--------|
| Plutchik wheel | Wheel with dyads + spawns | Done |
| Ekman facial | Flat list (6 basic emotions) | Planned |
| Parrott hierarchy | 3-tier tree (primary → secondary → tertiary) | Planned |
| Contrasting pairs/axes | 2D axes (valence × arousal) | Planned |
| Wheel of emotions image | Image-based interactive | Planned |
| Master combination | Aggregates all models | Future |

### Architecture Needs

- **Model registry**: defines available models, their metadata, and data shapes
- **Per-model data files**: `src/data/plutchik.json`, `src/data/ekman.json`, etc.
- **Shared vs model-specific components**: BubbleField works for Plutchik; other models need different visualizations (flat grid, tree view, 2D scatter, image overlay)
- **Model selector menu**: switch between classification systems in the UI

## Key Conventions

- Framer Motion for all animations (spring physics, `layout` prop)
- Dynamic inline styles for emotion `color` (not Tailwind classes)
- Functional state updates to avoid stale closures in callbacks
- Tests with Vitest + Testing Library (files in `src/__tests__/`)
- Dark theme only; no light mode currently
