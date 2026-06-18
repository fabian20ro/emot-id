# Lessons Learned

> maintained by AI agents. validated, reusable insights.
> **read start of every task. update end of every iteration.**

## How to Use

- **start of task:** read before writing code — avoid known mistakes
- **end of iteration:** new reusable insight? → add to appropriate category
- **promotion:** pattern 2+ times in `ITERATION_LOG.md` → promote here
- **pruning:** obsolete → Archive section (date + reason). never delete.

---

## Architecture & Design Decisions

**[2026-02-07]** Planning drift occurs when priority docs are inferred instead of read — Re-read `ANALYSIS.md` before ordering work. Quote exact section IDs/phase numbers when mapping priorities. Treat planning docs as authoritative artifacts.

**[2026-02-07]** Mobile clipping/overlap issues come from weak height constraints — Enforce explicit parent-child height chains (`h-full`, `min-h-0`) and normal-flow layout. Prefer structural sizing fixes over hardcoded transforms. Keep touch targets >=44px (>=48px for dense chip rows).

**[2026-02-24]** Emotion seed data includes deliberate non-obvious corrections — Preserve these unless explicitly revalidated: Plutchik `nostalgia = [serenity, sadness]`, Plutchik `compassion = [trust, sadness]`, duplicate `aggressiveness` stays replaced by `ruthlessness`, wheel uses `overwhelmed` instead of non-emotion label `busy`, and the dimensional model keeps extra unpleasant-calm emotions to avoid quadrant sparsity.

## Code Patterns & Pitfalls

**[2026-02-07]** Temporary script format must match module mode — `.js` + `require(...)` fails in `"type": "module"` repos. Use `.cjs` for CommonJS temporary scripts. Always check `package.json` module type before writing temp scripts.

**[2026-02-07]** Long `node -e` commands are brittle and expensive to debug — Quoting/syntax breakage in large inline commands causes repeated iterations. Move complex logic into script files. Reserve `node -e` for short commands only.

**[2026-06-19]** Catalog regeneration must preserve curated copy — Model overlays primarily own topology and colors; they are not complete translation sources. `scripts/extract-catalog.cjs` must merge existing non-empty labels, descriptions, and needs, and support the current somatic `contextDescription`/`contextNeeds` schema before rewriting catalog JSON.

## Testing & Quality

**[2026-02-07]** Preference tests become flaky when bypassing storage facade — Direct `localStorage` writes did not align with app read path. Mock/assert through `storage.get()` for behavior tests. Keep direct `localStorage` assertions for storage-layer tests only.

**[2026-02-07]** Duplicate text in UI requires scoped assertions — Single-match queries (`getByText`) fail where duplicate labels are expected. Use scoped or multi-match queries. Validate text uniqueness before using `getByText` single-match.

**[2026-02-07]** Build diagnostics should separate language correctness from toolchain instability — `npm run build` can fail in SW/PWA stage despite passing `tsc` and tests. Run `npx tsc -b` and tests as primary correctness gates. Report persistent plugin failures separately from app regressions.

**[2026-02-07]** Mobile visual fixes require measurement-backed validation — Repeated iterations result from unmeasured visual assumptions. Pair screenshots with scripted geometry checks at `393x742`. Capture before/after visuals and numeric bounds.

## Performance & Infrastructure

**[2026-02-07]** Browser automation can fail due to missing expected channel/runtime — Playwright MCP expected Chrome path unavailable. Verify runtime first, switch to local Playwright binaries if missing. Check browser availability before UI audits. Keep a fallback scripted audit path ready.

**[2026-02-07]** Sandbox restrictions can block local server/browser startup — `EPERM` during dev server and browser launch. Escalate as soon as a required command fails under sandbox rules. Assume UI audit setup may need escalation.

## Dependencies & External Services

**[2026-02-07]** Documentation accuracy depends on source verification — Stale behavior statements required follow-up fixes. Verify implementation details against actual source before writing docs. Map each doc claim to file/function evidence.

**[2026-02-17]** ESLint 10 blocked by typescript-eslint peer dependency — `@eslint/js@10` and `eslint@10` cannot be installed while `typescript-eslint` still requires `eslint ^8.57.0 || ^9.0.0`. Skip these until `typescript-eslint` releases a compatible version. Safe to update all other major bumps (`globals`, `jsdom`, `eslint-plugin-react-refresh`, `@types/node`) independently.

**[2026-02-17]** Always run `npm outdated` before and after updates — Distinguishes semver-compatible updates (`npm update`) from major version bumps (explicit `npm install pkg@latest`). Check peer dependency conflicts before batching major bumps.

**[2026-04-11]** Vitest packages must move together — Upgrading `vitest` without matching `@vitest/coverage-v8` left `package-lock.json` with incompatible peers and broke `npm ci` in CI. Treat `vitest` and `@vitest/*` helpers as a synchronized set; regenerate the lockfile and verify with fresh `npm ci`.

## Process & Workflow

**[2026-03-29]** Keep `AGENTS.md` in the ROM layer only — if a fact is discoverable from code, docs, configs, or tests, keep it out of bootstrap memory. Put repeated corrections in `LESSONS_LEARNED.md`; keep raw single-session observations in `ITERATION_LOG.md`.

**[2026-06-06]** GitHub Actions state can outrun local refs — For CI fixes, trust `gh run list/view` for the failing `headSha`, then `git fetch --all --prune` before comparing with local `origin/main`. Do not call a run stale from local refs until fetch succeeds.

---

## Archive

<!-- Lessons that are no longer applicable. Keep for historical context. -->
<!-- Format: **[YYYY-MM-DD] Archived [YYYY-MM-DD]** Title — Reason for archival -->
