work style: telegraph; noun-phrases ok; drop grammar; min tokens.

bootstrap only. discoverable from codebase -> nowhere. repeated corrections -> `LESSONS_LEARNED.md`.

before non-trivial work: read `LESSONS_LEARNED.md`.
end of iteration: add `ITERATION_LOG.md` entry. reusable insight or repeat issue -> promote to `LESSONS_LEARNED.md`.
maintenance/audit protocol: `SETUP_AI_AGENT_CONFIG.md`.

constraints:
- client-only; no backend, telemetry, or outbound network behavior without explicit product/security intent.
- user-facing copy: update both `src/i18n/en.json` and `src/i18n/ro.json`.
- fixed overlays: portal to `document.body` and focus-trap.
- crisis logic and gating semantics are safety-critical; keep deterministic/auditable; explicit tests for changes.

sub-agents: `.claude/agents/`
- `architect.md` - system design, ADRs, cross-module changes
- `planner.md` - complex multi-step implementation
- `ux-expert.md` - interaction, a11y, responsive decisions
- `psychologist.md` - emotion-model/domain review
- `code-simplifier.md` - post-change cleanup without behavior change
- `agent-creator.md` - create new focused agents
