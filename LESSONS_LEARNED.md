# Lessons Learned

> This file is maintained by AI agents working on this project.
> It captures validated, reusable insights discovered during development.
> **Read this file at the start of every task. Update it at the end of every iteration.**

## How to Use This File

### Reading (Start of Every Task)
Before starting any work, read this file to avoid repeating known mistakes
and to leverage proven approaches.

### Writing (End of Every Iteration)
After completing a task or iteration, evaluate whether any new insight was
gained that would be valuable for future sessions. If yes, add it to the
appropriate category below.

### Promotion from Iteration Log
Patterns that appear 2+ times in `ITERATION_LOG.md` should be promoted
here as a validated lesson.

### Pruning
If a lesson becomes obsolete (e.g., a dependency was removed, an API changed),
move it to the Archive section at the bottom with a date and reason.

---

## Architecture & Design Decisions

**[2026-02-07]** Planning drift occurs when priority docs are inferred instead of read — Re-read `ANALYSIS.md` before ordering work. Quote exact section IDs/phase numbers when mapping priorities. Treat planning docs as authoritative artifacts.

**[2026-02-07]** Mobile clipping/overlap issues come from weak height constraints — Enforce explicit parent-child height chains (`h-full`, `min-h-0`) and normal-flow layout. Prefer structural sizing fixes over hardcoded transforms. Keep touch targets >=44px (>=48px for dense chip rows).

## Code Patterns & Pitfalls

**[2026-02-07]** Temporary script format must match module mode — `.js` + `require(...)` fails in `"type": "module"` repos. Use `.cjs` for CommonJS temporary scripts. Always check `package.json` module type before writing temp scripts.

**[2026-02-07]** Long `node -e` commands are brittle and expensive to debug — Quoting/syntax breakage in large inline commands causes repeated iterations. Move complex logic into script files. Reserve `node -e` for short commands only.

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

## Process & Workflow

<!-- No entries yet -->

---

## Archive

<!-- Lessons that are no longer applicable. Keep for historical context. -->
<!-- Format: **[YYYY-MM-DD] Archived [YYYY-MM-DD]** Title — Reason for archival -->
