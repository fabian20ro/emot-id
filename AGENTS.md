Read CLAUDE.md

## Memory & Continuous Learning

This project maintains a persistent learning system across AI agent sessions.

### Required Workflow

1. **Start of task:** Read `LESSONS_LEARNED.md` before writing any code
2. **During work:** Note any surprises, gotchas, or non-obvious discoveries
3. **End of iteration:** Append to `ITERATION_LOG.md` with what happened
4. **End of iteration:** If the insight is reusable and validated, also add to `LESSONS_LEARNED.md`
5. **Pattern detection:** If the same issue appears 2+ times in the log, promote it to a lesson

### Files

| File | Purpose | When to Write |
|------|---------|---------------|
| `LESSONS_LEARNED.md` | Curated, validated, reusable wisdom | End of iteration (if insight is reusable) |
| `ITERATION_LOG.md` | Raw session journal, append-only | End of every iteration (always) |

### Rules

- Never delete entries from `ITERATION_LOG.md` — it's append-only
- In `LESSONS_LEARNED.md`, obsolete lessons go to the Archive section, not deleted
- Keep entries concise — a future agent scanning 100 entries needs signal, not prose
- Date-stamp everything in `YYYY-MM-DD` format
- When in doubt about whether something is worth logging: log it
