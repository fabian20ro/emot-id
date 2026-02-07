# Emot-ID Lessons Learned

Purpose: capture execution mistakes, friction points, and durable fixes so future work is faster and cleaner.

## How to use this file

1. Read this file at the start of non-trivial tasks.
2. Apply the relevant checklist before running tools or editing files.
3. Append a new lesson when:
   - a command/tooling failure costs time
   - a wrong assumption causes rework
   - a process gap causes inconsistent output

## Lesson Template

### [YYYY-MM-DD] Title

- Context:
- What went wrong:
- Impact:
- Corrective action:
- Prevention checklist:

---

### [2026-02-07] Browser audit blocked by Playwright MCP channel mismatch

- Context: Live UI audit with Playwright MCP on macOS.
- What went wrong: MCP expected system Chrome at `/Applications/Google Chrome.app/...`, which was not installed/accessible in this environment.
- Impact: Browser automation failed immediately; required fallback path and extra setup steps.
- Corrective action: Use local Playwright browser binaries and scripted audits as fallback.
- Prevention checklist:
  - Verify browser runtime availability before starting UI audit.
  - If MCP channel is missing, immediately switch to local Playwright script path.
  - Keep fallback script ready in repo-local temp path (and remove it after use).

### [2026-02-07] Sandbox/network permissions blocked local dev and browser launch

- Context: Starting Vite server and launching browser process for live audit.
- What went wrong: Commands failed under default sandbox (`EPERM`) and needed escalation.
- Impact: Repeated retries and avoidable delay.
- Corrective action: Escalate early once a required command fails due to sandbox restrictions.
- Prevention checklist:
  - For UI audits: assume `npm run dev` and browser launch may need escalation.
  - Re-run blocked command with escalation immediately, with clear justification.
  - Clean up background processes after audit completes.

### [2026-02-07] Node ESM/CJS mismatch for ad-hoc scripts

- Context: Running a temporary audit script in a repo with `"type": "module"`.
- What went wrong: Script used `require(...)` in `.js`; Node treated it as ESM and failed.
- Impact: Extra edit/rename cycle.
- Corrective action: Use `.cjs` for CommonJS ad-hoc scripts, or use ESM import syntax.
- Prevention checklist:
  - Check `package.json` module type before writing scripts.
  - Default temp scripts to `.cjs` when using `require`.

### [2026-02-07] Over-complex one-liners caused quoting/syntax failures

- Context: Large `node -e` commands for browser audit.
- What went wrong: Embedded quotes in strings broke command parsing.
- Impact: Failed run and wasted cycles debugging shell quoting.
- Corrective action: Move complex logic into a temporary script file.
- Prevention checklist:
  - Use `node <script>.cjs` for multi-step automation.
  - Reserve `node -e` for short commands only.

### [2026-02-07] Priority renumbering logic initially violated requested mapping

- Context: Re-phasing `TODOS.md` after inserting a new highest priority phase.
- What went wrong: First pass mapped old phase `-1` to `0`, but requested mapping was `-1 -> 1`, `0 -> 2`, etc.
- Impact: Needed a corrective renumber pass.
- Corrective action: Re-apply numbering with explicit old->new mapping and verify with grep.
- Prevention checklist:
  - Write mapping explicitly before editing.
  - Validate final phase/item numbering via pattern scan.

### [2026-02-07] Documentation assumptions drifted from implementation

- Context: Earlier doc update pass.
- What went wrong: Some behavioral statements were stale (bridge mapping, onboarding behavior, z-index references).
- Impact: Documentation required another alignment pass.
- Corrective action: Verify claims against source before writing doc updates.
- Prevention checklist:
  - For each doc claim, cite the concrete source file/function first.
  - Prefer “verify then write” over “write from memory”.

### [2026-02-07] Priority planning failed when ANALYSIS.md was inferred instead of read

- Context: Reordering work from `ANALYSIS.md` + `TODOS.md`.
- What went wrong: Priority assumptions were made before re-reading the actual analysis document.
- Impact: Rework and trust loss; priorities had to be corrected after user feedback.
- Corrective action: Treat planning docs as source-of-truth artifacts and re-read them before reprioritizing.
- Prevention checklist:
  - Before task ordering, read `ANALYSIS.md` and `TODOS.md` in full (or targeted sections with line refs).
  - Quote exact section IDs/phase numbers when mapping priorities.
  - Do not reuse prior-memory summaries as authoritative input.

### [2026-02-07] Mobile layout fixes need measurement-backed verification at target viewport

- Context: Pixel 9a layout audit and fixes for bubble spread, body map visibility, and label overflow.
- What went wrong: Visual claims were initially discussed without consistent metric capture.
- Impact: Extra iterations to confirm whether issues were truly fixed.
- Corrective action: Pair screenshot review with scripted viewport probes at `393x742`.
- Prevention checklist:
  - Always run before/after checks at `393x742` for mobile layout fixes.
  - Capture both visual artifacts (screenshots) and numeric evidence (e.g., element bounds).
  - Keep temp audit scripts repo-local and delete them once evidence is recorded.

### [2026-02-07] Tests tied to raw localStorage became brittle after storage facade changes

- Context: Adding regression tests for simple-language mode.
- What went wrong: Tests wrote directly to `window.localStorage` and expected provider state to reflect it, but app logic reads through `storage.get()` and tests became flaky/non-deterministic.
- Impact: False-negative test failures for simple-language prompts and descriptions.
- Corrective action: Mock/spy `storage.get()` in behavior-specific tests instead of assuming raw storage wiring.
- Prevention checklist:
  - For preference-driven behavior, assert through the storage facade API used by the app.
  - Reserve direct `localStorage` assertions for storage-layer tests only.
  - Restore storage mocks in `beforeEach`/`afterEach` to avoid cross-test leakage.

### [2026-02-07] Duplicate text assertions in UI tests caused avoidable failures

- Context: SessionHistory regression test for top-identified emotions.
- What went wrong: Used single-element query (`getByText`) for emotion labels that also appear in session rows.
- Impact: Test failed due to multiple matches, not product behavior.
- Corrective action: Use scoped queries or `getAllByText` when duplicate labels are expected by design.
- Prevention checklist:
  - Audit whether target text is unique before using single-match queries.
  - Prefer section-scoped assertions for repeated content.
  - Use count-based assertions for duplicate-friendly UIs.

### [2026-02-07] Build validation should separate TypeScript correctness from PWA plugin instability

- Context: Final validation after large feature/test additions.
- What went wrong: `npm run build` failed at service-worker generation (`workbox`/`terser` early exit) despite successful `tsc` and passing tests.
- Impact: Build status appeared ambiguous without distinguishing code regressions from known tooling instability.
- Corrective action: Run `npx tsc -b` and `npm test` as primary correctness gates, then report `npm run build` PWA failure as a known external blocker.
- Prevention checklist:
  - Always run `tsc` separately before diagnosing build plugin failures.
  - Document persistent build-tool errors with exact stage and stack marker.
  - Avoid conflating plugin/runtime tooling failures with application logic regressions.
