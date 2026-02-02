# Emot-ID

> **[Try the live app →](https://fabian20ro.github.io/emot-id)**

Interactive PWA for identifying and exploring emotions through multiple classification models.

## What does it do?

- **Multiple models** — Explore emotions through Plutchik's wheel (dyad combinations), Emotion Wheel (hierarchical drill-down), Body Map (physical sensations), or Emotional Space (2D valence/arousal)
- **Select emotions** — Tap bubbles, body regions, or scatter plot dots that resonate with your current state
- **Discover patterns** — The app detects dyads, somatic patterns, and emotional complexity
- **Safety-aware** — Tiered crisis detection with grounding techniques for high-distress combinations
- **Explore with AI** — Direct link to Google AI for deeper analysis

## Features

- 4 emotion classification models with distinct visualizations
- Bilingual support (English / Romanian)
- Narrative synthesis — personalized paragraph describing your emotional state
- Cross-model bridges — suggestions to explore with a different model
- Non-skippable onboarding for first-time users
- Sound feedback on selection (mutable)
- Responsive — works on mobile and desktop
- Installable PWA — works offline after first load

## Tech Stack

- React 19 + TypeScript 5.9
- Vite 7 + vite-plugin-pwa
- Tailwind CSS 4
- Framer Motion 12
- Vitest + Testing Library

## Local Development

```bash
npm install
npm run dev
```

| Command | Action |
|---------|--------|
| `npm run dev` | Vite dev server |
| `npm run build` | TypeScript check + Vite build |
| `npm test` | Run all tests (232 tests) |
| `npm run test:watch` | Watch mode |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## Credits

Emotion models based on:
- [Plutchik's Wheel of Emotions](https://en.wikipedia.org/wiki/Robert_Plutchik#Plutchik's_wheel_of_emotions) (Robert Plutchik, 1980)
- [Emotion Wheel](https://en.wikipedia.org/wiki/Emotion_classification) (hierarchical classification)
- [Body Map of Emotions](https://en.wikipedia.org/wiki/Bodily_map_of_emotions) (Nummenmaa et al., 2014)
- [Circumplex Model](https://en.wikipedia.org/wiki/Circumplex_model_of_affect) (Russell, 1980) — valence/arousal dimensional approach

## License

MIT
