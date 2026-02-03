# Contributing to Emot-ID

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
git clone https://github.com/fabian20ro/emot-id.git
cd emot-id
npm install
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | TypeScript check + Vite production build |
| `npm test` | Run all tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Project Structure

See [Architecture Codemap](CODEMAPS/architecture.md) for full file map.

Key directories:
- `src/models/` — Emotion classification models (Plutchik, Wheel, Somatic, Dimensional)
- `src/components/` — All React components (flat structure)
- `src/hooks/` — Custom React hooks
- `src/data/` — Storage, session persistence, derived analytics
- `src/i18n/` — Bilingual UI strings (English + Romanian)
- `src/__tests__/` — Vitest + Testing Library tests

## Adding a New Emotion Model

1. Create `src/models/<id>/` with `types.ts`, `index.ts`, `data.json`
2. Extend `BaseEmotion` with model-specific fields in `types.ts`
3. Implement `EmotionModel<YourType>` interface in `index.ts`
   - Set `shortName` (optional `{ ro, en }`) for compact display in ModelBar on narrow screens
4. Add model ID to `MODEL_IDS` in `src/models/constants.ts`
5. Register in `src/models/registry.ts` with a visualization component
6. Add i18n keys to `src/i18n/ro.json` and `src/i18n/en.json`
7. Add first-hint text to `firstHint.<modelId>` in both i18n files

## Key Components

| Component | Purpose |
|-----------|---------|
| `InfoButton` | Reusable info icon (circled "i") that opens a portal modal with title + children content. Uses focus trap and Escape-to-close. Replaces `<details>` for inline disclosures (disclaimer, result descriptions, privacy). |
| `BubbleField` | Plutchik bubble visualization (clamped to viewport bounds) |
| `BodyMap` | Somatic body outline with selectable regions |
| `DimensionalField` | 2D valence/arousal field with label collision avoidance |
| `ModelBar` | Tab bar for switching models; shows `shortName` on narrow screens |
| `SettingsMenu` | Language toggle, sound toggle, privacy info, session history link |
| `ResultCard` | Analysis results with expandable descriptions via InfoButton |

## Conventions

- **Dark theme only** — no light mode
- **Bilingual** — all user-facing text needs both `ro` and `en` versions
- **Framer Motion** for all animations (spring physics, `layout` prop)
- **Dynamic inline styles** for emotion `color` (not Tailwind classes)
- **React.memo** on visualization components (Bubble, BodyRegion, BubbleField, BodyMap, DimensionalField)
- **Functional state updates** to avoid stale closures in callbacks
- **Type-safe i18n** — use `section('sectionName')` from `useLanguage()` instead of casting `t`
- **Portal modals** — use `InfoButton` (or `createPortal`) for overlays so they escape parent overflow/z-index

## Testing

- Test runner: Vitest + Testing Library + jsdom
- Test files: `src/__tests__/*.test.ts(x)`
- Run `npm test` before committing

## Environment

No environment variables needed — this is a client-only PWA with no backend.

## Deployment

Deployed automatically to GitHub Pages at `/emot-id/` via GitHub Actions on push to `main`.
