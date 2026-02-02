# Emot-ID Runbook

## Architecture Overview

Client-only PWA (Progressive Web App). No backend, no API server, no database server. All data lives in the browser:
- **Preferences**: localStorage (model, language, sound, onboarding, hints)
- **Session history**: IndexedDB via `idb-keyval`

Deployed to GitHub Pages at `https://fabian20ro.github.io/emot-id/`.

## Build & Deploy

```bash
# Local build
npm run build        # tsc -b && vite build → outputs to dist/

# Local preview
npm run preview      # serves dist/ on localhost

# Deploy
# Automatic via GitHub Actions on push to main
```

## Common Tasks

### Verify build health

```bash
npm run build && npm test && npm run lint
```

### Clear user data (development)

In browser DevTools console:
```javascript
// Clear preferences
localStorage.clear()

// Clear session history (IndexedDB)
indexedDB.deleteDatabase('keyval-store')
```

### Add i18n strings

1. Add key to both `src/i18n/en.json` and `src/i18n/ro.json`
2. Access via `useLanguage().section('sectionName').keyName`
3. The `i18n-completeness.test.ts` test verifies both files have matching keys

### Debug crisis detection

Crisis tiers are determined by `getCrisisTier()` in `src/models/distress.ts`:
- Check `HIGH_DISTRESS_IDS` set for the emotion IDs in question
- Check `TIER3_COMBOS` for specific pair combinations
- Temporal escalation in `src/data/temporal-crisis.ts` requires 3+ tier2/3 sessions in 7 days

### Debug somatic scoring

The scoring algorithm in `src/models/somatic/scoring.ts`:
1. Matches sensation type + minimum intensity against `emotionSignals` in `data.json`
2. Accumulates weighted scores per emotion across body groups
3. Applies coherence bonus (1.2x for 2 groups, 1.3x for 3, 1.4x for 4+)
4. Filters by threshold (0.5), takes top 4

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

## Monitoring

No server-side monitoring (client-only app). Key health indicators:
- GitHub Actions build status
- Manual testing on mobile (375px viewport)
- Keyboard-only navigation through full flow
- Crisis path: select distress emotions → verify banner appears

## Data Privacy

- All data stored locally in user's browser
- No telemetry, no analytics, no external API calls
- "Clear all data" button in SessionHistory removes all IndexedDB records
- JSON export lets users download and manage their own data
