# Emot-ID Runbook

## Architecture Overview

Client-only PWA (Progressive Web App). No backend, no API server, no database server. All data lives in the browser:
- **Preferences**: localStorage (model, language, sound, onboarding, hints)
- **Session history**: IndexedDB via `idb-keyval` (store: `emot-id-sessions`)

Deployed to GitHub Pages at `https://fabian20ro.github.io/emot-id/`.

Local dev URL (because Vite `base` is `/emot-id/`): `http://localhost:5173/emot-id/`

## Build & Deploy

```bash
# Local build
npm run build        # tsc -b && vite build → outputs to dist/

# Local preview
npm run preview      # serves dist/ on localhost

# Deploy
# Automatic via GitHub Actions on push to main
# Pipeline: npm ci → npm test → npm run build → deploy to Pages
```

## Testing

### Unit tests

```bash
npm test             # Run all Vitest tests once
npm run test:watch   # Watch mode for iterating
```

### E2E tests

```bash
npm run test:e2e     # Playwright: mobile Safari (iPhone 14) + Chrome (Pixel 7)
npm run test:e2e:ui  # Same tests with Playwright UI for debugging
```

E2E tests live in `e2e/` and auto-start the dev server. Base URL: `http://localhost:5173/emot-id/`.

### Verify build health

```bash
npm run build && npm test && npm run lint
```

## Common Tasks

### Clear user data (development)

In browser DevTools console:
```javascript
// Clear preferences
localStorage.clear()

// Clear session history (IndexedDB)
indexedDB.deleteDatabase('emot-id-sessions')
```

### Add i18n strings

1. Add key to both `src/i18n/en.json` and `src/i18n/ro.json`
2. Access via `useLanguage().section('sectionName').keyName`
3. The `i18n-completeness.test.ts` test verifies both files have matching keys

Current top-level i18n sections: `app`, `menu`, `selectionBar`, `analyze`, `modal`, `reflection`, `crisis`, `disclaimer`, `onboarding`, `results`, `settings`, `bridges`, `firstHint`, `dontKnow`, `somatic`, `intervention`, `infoButton`, `privacy`, `dimensional`, `history`.

### Debug crisis detection

Crisis tiers are determined by `getCrisisTier()` in `src/models/distress.ts`:
- **tier1** — 1 high-distress match (warm invitation)
- **tier2** — 2+ high-distress matches (amber alert with grounding)
- **tier3** — specific severe pairs (most direct), e.g. despair+helpless, shame+worthless
- **tier4** — high-risk triples (emergency), e.g. despair+worthless+empty — requires explicit acknowledgment before results shown

**Graduated access**: Tier1-3 show crisis banner alongside all features (AI link, opposite action, micro-interventions). Only tier4 pre-acknowledgment gates features behind an acknowledgment wall; they become available after the user acknowledges.

High-distress IDs: `despair`, `rage`, `terror`, `grief`, `shame`, `loathing`, `worthless`, `helpless`, `apathetic`, `empty`, `powerless`, `abandoned`, `victimized`, `numb`, `violated`, `depressed`, `distressed`.

Temporal escalation in `src/data/temporal-crisis.ts` requires 3+ tier2/3/4 sessions in 7 days.

### Debug somatic scoring

The scoring algorithm in `src/models/somatic/scoring.ts`:
1. Matches sensation type + minimum intensity against `emotionSignals` in `data.json`
2. Accumulates weighted scores per emotion across body groups
3. Applies coherence bonus (1.2x for 2 groups, 1.3x for 3, 1.4x for 4+)
4. Filters by threshold (0.5), takes top 4

### Data export

Export functionality in `src/data/export.ts`:
- **JSON export**: full session data as `emot-id-sessions-{timestamp}.json`
- **Text summary**: readable summary as `emot-id-summary-{timestamp}.txt`
- **Clipboard copy**: for sharing with therapist

Accessible from SessionHistory component.

### Session history analytics

Analytics derived from session history (`src/data/`):
- **Vocabulary** (`vocabulary.ts`): unique emotion count, milestones (5/10/15/25/40/60 emotions, 2/3/4 models)
- **Somatic patterns** (`somatic-patterns.ts`): body region frequencies and sensation types
- **Valence ratio** (`valence-ratio.ts`): pleasant/unpleasant/neutral counts (7-day window)
- **Opposite action** (`opposite-action.ts`): DBT-inspired suggestions for 7 emotion patterns

## Troubleshooting

### Build fails with type errors

```bash
npx tsc -b --noEmit   # Check TypeScript errors without building
```

### Tests fail

```bash
npm run test:watch     # Watch mode for iterating on fixes
```

### PWA not updating

The service worker caches aggressively. Users may need to:
1. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear site data in DevTools > Application > Storage

### IndexedDB issues

If `idb-keyval` fails (e.g., in private browsing), the app gracefully degrades — sessions aren't saved but the app remains functional. Check `useSessionHistory` hook error handling.

### Mobile layout issues

**Target testing viewport**: 393×742 (Pixel 9a Chrome, 9:17 visible ratio after browser chrome). Also verify on 320×604 (smallest phone).

**Chrome DevTools setup**: Open DevTools → Toggle device toolbar → Add custom device: 393×742, mobile, touch.

**Settings drawer testing**:
- Tap hamburger → bottom sheet slides up from bottom
- Verify all items are scrollable and tappable
- Swipe down on drawer → dismisses
- Tap backdrop → dismisses
- Press Escape → dismisses
- Tab key cycles within drawer (focus trap)

Common mobile viewport problems and their fixes:

- **BubbleField top clustering on mobile** — Bubble canvas must inherit full height from parent. Verify `BubbleField` wrappers keep `h-full min-h-0` and parent flex chain doesn't collapse
- **BodyMap regions untappable** — Small regions (throat, jaw) use expanded `hitD` paths. Label pills use invisible 48px hit rectangles. Check `body-paths.ts` `hitD` values and label hit rect sizing in `BodyMap.tsx`
- **BodyMap lower regions cut off** — BodyMap now relies on height-fit rendering (`h-full min-h-0` container + `h-full w-auto max-w-full` SVG) instead of manual vertical shifts. If feet disappear, inspect `data-testid="bodymap-root"` and `data-testid="bodymap-canvas"` sizing chain and confirm no parent collapses
- **ModelBar names overflow** — Models define `shortName` for narrow viewports (<480px); names swap automatically
- **DimensionalField label overlap** — Axis labels use collision-avoidance offsets at small widths
- **Dimensional suggestions overlap plot** — Suggestion chips should render in tray below plot (`data-testid="dimensional-suggestion-tray"`), not as `absolute` overlay. If overlap returns, verify tray remains outside `dimensional-plot-container`
- **Safe-area double padding** — Safe-area insets are per-component (Header top, BottomBar bottom), NOT on `#root`. If bottom content is cut off, check for duplicate `env(safe-area-inset-bottom)` application
- **Settings menu invisible** — If the menu renders but is hidden behind content, it's likely trapped in a stacking context. The fix is `createPortal(…, document.body)`. This was the root cause of the Phase K stabilization

## Monitoring

No server-side monitoring (client-only app). Key health indicators:
- GitHub Actions build status (unit tests run in CI)
- Manual testing on mobile (393×742 viewport, also verify 320px minimum)
- Keyboard-only navigation through full flow
- Crisis path: select distress emotions → verify banner appears

## Data Privacy

- All data stored locally in user's browser
- No telemetry, no analytics, no automatic external API calls
- External links open only on explicit user action (e.g. helpline resources, Google query)
- "Clear all data" button in SessionHistory removes all IndexedDB records
- JSON export lets users download and manage their own data
- Privacy disclosure accessible in SettingsMenu via InfoButton (i18n key: `privacy`)
