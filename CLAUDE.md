# Emot-ID

Interactive emotion identification PWA (React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Framer Motion 12, PWA via vite-plugin-pwa, deployed to GitHub Pages at `/emot-id/`).

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build` |
| `npm test` | `vitest run` |
| `npm run test:watch` | `vitest` (watch mode) |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `emot-id-model` | Last selected model ID |
| `emot-id-sound-muted` | Sound mute preference |
| `emot-id-onboarded` | Onboarding completed flag |
| `emot-id-hint-<modelId>` | First interaction hint dismissed per model |
| `emot-id-language` | UI language (`ro` or `en`) |

## Data Quality Notes

- Plutchik dyads: `nostalgia` uses `[serenity, sadness]` (not `[joy, sadness]`) to differentiate from `bittersweetness`
- Plutchik: `compassion` uses `[trust, sadness]` (not `[love, sadness]`) to be reachable from primary emotions
- Plutchik: `ruthlessness` replaced `aggressiveness` (was duplicate of `aggression`)
- Wheel: `overwhelmed` replaced `busy` (busy is not an emotion)
- Dimensional: 5 emotions added to fill unpleasant-calm quadrant gap (apathetic, melancholic, resigned, pensive, contemplative)

## Reference

When you need deeper context, read the relevant file:

| Need | Read |
|------|------|
| Conventions, project structure, adding models | `docs/CONTRIB.md` |
| Architecture, state, data flow, safety, i18n | `docs/CODEMAPS/architecture.md` |
| Emotion models, types, scoring algorithms | `docs/CODEMAPS/models.md` |
| Components, hooks, accessibility, animations | `docs/CODEMAPS/frontend.md` |
| Build, deploy, debug, troubleshooting | `docs/RUNBOOK.md` |
