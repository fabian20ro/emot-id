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
| `npm run dev` | Start Vite dev server (`http://localhost:5173/emot-id/`) |
| `npm run build` | TypeScript check + Vite production build |
| `npm test` | Run all unit tests once (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests (mobile Safari + Chrome) |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Project Structure

See [Architecture Codemap](CODEMAPS/architecture.md) for full file map.

Key directories:
- `src/models/` — Emotion classification models (Plutchik, Wheel, Somatic, Dimensional)
- `src/components/` — All React components (flat structure)
- `src/hooks/` — Custom React hooks
- `src/data/` — Storage, session persistence, derived analytics, export
- `src/i18n/` — Bilingual UI strings (English + Romanian)
- `src/__tests__/` — Vitest + Testing Library unit tests
- `e2e/` — Playwright E2E tests (mobile viewports)

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
| `BubbleField` | Bubble visualization for Plutchik/Wheel (clamped to viewport bounds) |
| `BodyMap` | Somatic body outline with selectable regions |
| `DimensionalField` | 2D valence/arousal field with label collision avoidance and persistent axis labels |
| `GuidedScan` | Guided body scan flow (centering breath, 5 body groups, numbness/flooding detection) |
| `ModelBar` | Tab bar for switching models; renders inline in Header, shows `shortName` on <480px |
| `ResultModal` | Analysis results with reflection prompts |
| `QuickCheckIn` | Fast 1-3 emotion check-in that reuses crisis + result pipeline |
| `GranularityTraining` | Optional settings-launched practice mode for finer emotion discrimination |
| `ChainAnalysis` | Optional DBT worksheet mode for trigger→consequence sequence mapping |
| `ResultCard` | Individual result with expandable descriptions via InfoButton |
| `CrisisBanner` | Tiered crisis support resources (4 tiers + grounding technique for tiers 2/3); graduated access — tier1-3 contextualize without gatekeeping, tier4 requires acknowledgment |
| `MicroIntervention` | Brief coping interventions plus post-practice effectiveness check |
| `ModalShell` | Shared modal/backdrop primitive for centered dialogs and sheets |
| `DontKnowModal` | Entry point for users unsure what they feel |
| `SelectionBar` | Horizontal scroll strip: selections + combos with clear/undo |
| `SettingsMenu` | Bottom sheet drawer: language, simple mode, model, sound, reminders, history, chain analysis, privacy, disclaimer |
| `SessionHistory` | Past sessions with vocabulary stats, localized labels, valence ratio, export |
| `InfoButton` | Reusable portal modal (focus trap, Escape-to-close) for inline disclosures |
| `UndoToast` | Undo notification after clearing selections |
| `VisualizationErrorBoundary` | Error boundary wrapping visualization components |

## Conventions

- **Dark theme only** — no light mode
- **Bilingual** — all user-facing text needs both `ro` and `en` versions
- **Framer Motion** for all animations (spring physics, `layout` prop)
- **Dynamic inline styles** for emotion `color` (not Tailwind classes)
- **React.memo** on visualization components (Bubble, BodyRegion, BubbleField, BodyMap, DimensionalField)
- **Functional state updates** to avoid stale closures in callbacks
- **Type-safe i18n** — use `section('sectionName')` from `useLanguage()` instead of casting `t`
- **Simple-language compatibility** — if you add explanatory copy, provide both standard and simplified variants where applicable
- **Portal modals** — all `position: fixed` overlays must use `createPortal(content, document.body)` to escape parent stacking contexts (WebKit's `backdrop-filter` creates new stacking contexts)
- **44px touch targets** — all interactive elements must have `min-h-[44px] min-w-[44px]`. SVG elements use invisible `<rect>` elements behind visible paths for hit expansion
- **Safe-area insets** — applied per-component, NOT on `#root`. Header gets `pt-[env(safe-area-inset-top)]`, bottom bar gets `pb-[max(0.5rem,env(safe-area-inset-bottom))]`, `#root` only has horizontal insets
- **Mobile breakpoint** — 480px is the "compact phone" breakpoint (`MOBILE_BREAKPOINT` in `bubble-layout.ts`, `min-[480px]:` in Tailwind). Standard Tailwind `sm:` (640px) for desktop
- **Z-index scale** — use CSS custom properties from `index.css` (`--z-base`, `--z-header`, `--z-dropdown`, `--z-backdrop`, `--z-modal`, `--z-toast`, `--z-onboarding`)
- **Layout constants** — `--viz-padding` and `--chrome-height` in `index.css` for consistent spacing

## Documentation Sync Rule

If behavior changes, update docs in the same PR:
- `README.md` for user-visible feature or workflow changes
- `docs/RUNBOOK.md` for operations/troubleshooting changes
- `docs/CODEMAPS/*.md` for architecture/component/model changes

## Testing

### Unit Tests
- Runner: Vitest + Testing Library + jsdom
- Location: `src/__tests__/*.test.ts(x)`
- Run: `npm test`
- Phase 5 regression coverage:
  - `src/__tests__/SessionHistory.test.tsx` (active/passive vocabulary + top identified list)
  - `src/__tests__/registry.test.ts` (lazy registry metadata + `loadModel()`)
  - `src/__tests__/reminders.test.ts` (permission and 24h cadence)
  - `src/__tests__/ChainAnalysis.test.tsx` (save flow + recent/clear actions)
  - `src/__tests__/SettingsMenu.test.tsx` and `src/__tests__/ResultModal.test.tsx` (simple-language behavior)
  - `src/__tests__/useEmotionModel.test.ts` (somatic lazy load readiness)

### E2E Tests
- Runner: Playwright
- Location: `e2e/*.spec.ts`
- Viewports: iPhone 14 (Safari), Pixel 7 (Chrome)
- Run: `npm run test:e2e`
- Dev server starts automatically via Playwright config

### Pre-commit
- Run `npm test && npm run lint` before committing

## Environment

No environment variables needed — this is a client-only PWA with no backend.

## Deployment

Deployed automatically to GitHub Pages at `/emot-id/` via GitHub Actions on push to `main`. The CI pipeline runs unit tests before building.
