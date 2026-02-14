# Emot-ID Lessons Memory (Observational Mechanism)

Purpose: maintain durable project memory with stable, compressible context instead of a growing list of full postmortems.

## Mechanism

This file now uses an observational-memory workflow:

1. Raw Incident Buffer: recent, high-fidelity failures or rework events.
2. Observation Log: compressed, dated, prioritized facts extracted from incidents.
3. Reflection Log: periodic condensation/reorganization of observations.

The goal is to preserve decisions and prevention rules while keeping memory small, stable, and easy to scan.

## Runbook

### Observer cycle (incident -> observations)

Trigger Observer when either condition is true:

- Raw Incident Buffer has 8+ incidents, or
- Raw Incident Buffer exceeds about 3,000 words.

Observer actions:

1. Convert incidents into dated observations.
2. Keep event/decision details, remove narrative filler.
3. Extract explicit prevention checklists.
4. Move processed incidents out of the Raw Incident Buffer.

Observation format:

```
Date: YYYY-MM-DD
- [P1|P2|P3] HH:MM concise observation
  - Evidence:
  - Decision:
  - Prevention checklist:
    - ...
```

Priority scale:

- `P1`: likely to cause immediate rework/regression.
- `P2`: recurring process/tooling friction.
- `P3`: useful optimization/cleanup guidance.

### Reflector cycle (observations -> reflected memory)

Trigger Reflector when either condition is true:

- Observation Log has 40+ entries, or
- Observation Log exceeds about 8,000 words.

Reflector actions:

1. Merge duplicates and superseded observations.
2. Group by durable themes.
3. Promote persistent rules into "Active Guardrails".
4. Keep original dates and preserve any unresolved risks.

### Consumption gate (required before non-trivial work)

1. Read `Active Guardrails`.
2. Read the most recent `P1`/`P2` observations.
3. If task touches mobile UI, storage, tests, build, or docs, read that section's reflected rules first.

## Active Guardrails (Reflected)

- Verify environment/runtime constraints early (browser/runtime/sandbox) and escalate blocked commands immediately.
- Prefer script files over fragile one-liners for multi-step automation.
- In module projects, default ad-hoc CommonJS scripts to `.cjs` when using `require(...)`.
- Re-read source-of-truth planning docs before reprioritization (`ANALYSIS.md`, `TODOS.md`).
- Verify doc claims against concrete source locations before writing/updating docs.
- For mobile UI fixes, validate at `393x742` with both screenshots and measurable bounds.
- For preference behavior tests, assert through the storage facade used by app code.
- In UI tests, use scoped or count-based queries when duplicate text is expected.
- Separate TypeScript correctness checks from bundler/PWA plugin failures during validation.
- Prefer structural layout fixes over positional hacks in constrained mobile containers.

## Observation Log (Seeded from prior lessons)

Date: 2026-02-07

- [P1] 09:10 Browser automation can fail due to missing expected channel/runtime.
  - Evidence: Playwright MCP expected Chrome path unavailable.
  - Decision: verify runtime first, switch to local Playwright binaries if missing.
  - Prevention checklist:
    - Check browser availability before UI audits.
    - Keep a fallback scripted audit path ready.

- [P1] 09:14 Sandbox restrictions can block local server/browser startup.
  - Evidence: `EPERM` during dev server and browser launch.
  - Decision: escalate as soon as a required command fails under sandbox rules.
  - Prevention checklist:
    - Assume UI audit setup may need escalation.
    - Re-run blocked commands with clear justification immediately.

- [P2] 09:18 Temporary script format must match module mode.
  - Evidence: `.js` + `require(...)` failed in `"type": "module"` repo.
  - Decision: use `.cjs` for CommonJS temporary scripts.
  - Prevention checklist:
    - Check `package.json` module type before writing temp scripts.

- [P2] 09:22 Long `node -e` commands are brittle and expensive to debug.
  - Evidence: quoting/syntax breakage in large inline commands.
  - Decision: move complex logic into script files.
  - Prevention checklist:
    - Reserve `node -e` for short commands only.

- [P1] 09:26 Planning drift occurs when priority docs are inferred instead of read.
  - Evidence: reprioritization had to be corrected after feedback.
  - Decision: treat planning docs as authoritative artifacts.
  - Prevention checklist:
    - Re-read `ANALYSIS.md` and `TODOS.md` before ordering work.
    - Quote exact section IDs/phase numbers when mapping priorities.

- [P2] 09:31 Documentation accuracy depends on source verification.
  - Evidence: stale behavior statements required follow-up fixes.
  - Decision: verify implementation details before writing docs.
  - Prevention checklist:
    - Map each doc claim to file/function evidence.

- [P1] 09:36 Mobile visual fixes require measurement-backed validation.
  - Evidence: repeated iterations due to unmeasured visual assumptions.
  - Decision: pair screenshots with scripted geometry checks at `393x742`.
  - Prevention checklist:
    - Capture before/after visuals and numeric bounds.

- [P2] 09:40 Preference tests became flaky when bypassing storage facade.
  - Evidence: direct `localStorage` writes did not align with app read path.
  - Decision: mock/assert through `storage.get()` for behavior tests.
  - Prevention checklist:
    - Keep direct `localStorage` assertions for storage-layer tests only.

- [P2] 09:44 Duplicate text in UI requires scoped assertions.
  - Evidence: single-match query failed where duplicate labels are expected.
  - Decision: use scoped or multi-match queries.
  - Prevention checklist:
    - Validate text uniqueness before `getByText` single-match usage.

- [P2] 09:49 Build diagnostics should separate language correctness from toolchain instability.
  - Evidence: `npm run build` failed in SW/PWA stage despite passing `tsc` and tests.
  - Decision: run `npx tsc -b` and tests as primary correctness gates.
  - Prevention checklist:
    - Report persistent plugin failures separately from app regressions.

- [P1] 09:54 Mobile clipping/overlap issues come from weak height constraints.
  - Evidence: visualization clipping and overlap in flex chains.
  - Decision: enforce explicit parent-child height chains (`h-full`, `min-h-0`) and normal-flow layout.
  - Prevention checklist:
    - Prefer structural sizing fixes over hardcoded transforms.
    - Keep touch targets >=44px (>=48px for dense chip rows).

## Raw Incident Buffer

Use this template for new incidents (append newest first):

```
### [YYYY-MM-DD HH:MM] Title
- Context:
- Failure:
- Impact:
- Immediate fix:
- Candidate prevention checklist:
```

Current incidents: none.

## References

- [VentureBeat: "Observational memory" cuts AI agent costs 10x](https://venturebeat.com/data/observational-memory-cuts-ai-agent-costs-10x-and-outscores-rag-on-long-context-benchmarks/)
- [Mastra Research: Observational Memory (95% on LongMemEval)](https://mastra.ai/research/observational-memory)
- [Mastra Docs: Observational Memory](https://mastra.ai/docs/memory/observational-memory)
- [LongMemEval paper (arXiv 2410.10813)](https://arxiv.org/abs/2410.10813)
- [OpenAI Prompt Caching guide](https://platform.openai.com/docs/guides/prompt-caching)
- [Anthropic Prompt Caching docs](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
