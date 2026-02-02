# Dead Code Analysis

**Generated:** 2026-02-03
**Tools:** knip, depcheck

## Findings

### SAFE — Unused File
| File | Finding | Action |
|------|---------|--------|
| `src/data/progression.ts` | Unused file — not imported anywhere | **DELETE** (was implemented for E.2 but never wired into UI) |

### SAFE — Unused Export
| File | Export | Action |
|------|--------|--------|
| `src/data/session-repo.ts:16` | `getSession` function | **REMOVE** export (not used by any consumer) |

### SAFE — Unused DevDependency
| Package | Action |
|---------|--------|
| `@vitest/coverage-v8` | **KEEP** — needed for `vitest --coverage` command even if not in scripts |

### FALSE POSITIVE
| Tool | Finding | Reason |
|------|---------|--------|
| depcheck | `tailwindcss` unused | Used via `@import "tailwindcss"` in CSS + `@tailwindcss/vite` plugin |

## Summary
- 1 file to delete (`progression.ts`)
- 1 unused export to remove (`getSession`)
- 0 dependency changes
