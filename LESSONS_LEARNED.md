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
