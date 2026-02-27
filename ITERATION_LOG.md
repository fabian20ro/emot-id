# Iteration Log

> Append-only journal of AI agent work sessions on this project.
> **Add an entry at the end of every iteration.**
> When patterns emerge (same issue 2+ times), promote to `LESSONS_LEARNED.md`.

## Format

Each entry should follow this structure:

---

### [YYYY-MM-DD] Brief Description of Work Done

**Context:** What was the goal / what triggered this work
**What happened:** Key actions taken, decisions made
**Outcome:** Result — success, partial, or failure
**Insight:** (optional) What would you tell the next agent about this?
**Promoted to Lessons Learned:** Yes/No

---

### [2026-02-24] Restructure AI agent config per setup guide

**Context:** Applied research-backed AI agent configuration guide (Evaluating AGENTS.md, SkillsBench) to restructure project config files. Goal: remove discoverable content from agent context, keep only non-discoverable policy/constraints.
**What happened:**
- Swapped CLAUDE.md ↔ AGENTS.md roles: CLAUDE.md is now a redirect ("Read AGENTS.md"), AGENTS.md is the canonical bootstrap file.
- Trimmed AGENTS.md from 151 lines (old CLAUDE.md content) to ~65 lines. Removed: tech stack listing, quality gate commands, persistence contracts table (was already stale — 6 keys documented vs 8 in storage.ts), new model checklist, UI interaction rules, docs map. All discoverable from codebase.
- Preserved: operating priorities, safety guardrails (all 5), data integrity notes (all 5), constraints (client-only, i18n mandate, portal/focus-trap, crisis determinism), learning system, workflow essentials.
- Added 2 new sub-agents: `planner.md` (implementation planning for multi-step features) and `agent-creator.md` (meta-agent for creating new specialists).
- Kept all 4 existing project-specific agents unchanged (psychologist, senior-software-engineer, code-simplifier, ux-expert).
- Did NOT add architect.md — senior-software-engineer already covers that role.
- Fixed phantom reference to nonexistent `TODOS.md` (replaced with `ANALYSIS.md`).
**Outcome:** Success. Config files are leaner, policy-focused. Zero code changes — build/tests unaffected.
**Insight:** The Persistence Contracts table being stale (6 vs 8 keys) validated the guide's core premise: duplicating discoverable info creates drift. The portal/focus-trap invariant was kept despite being visible in code because the WebKit stacking context bug it prevents is non-obvious.
**Promoted to Lessons Learned:** No (one-time restructuring, not a reusable technical pattern)

---

### [2026-02-17] Update dependencies to latest versions

**Context:** Branch `claude/update-dependencies-1g80E` — update all project dependencies to current versions.
**What happened:**
- Ran `npm update` for semver-compatible bumps (framer-motion 12.29->12.34, @vitejs/plugin-react 5.1.2->5.1.4, @playwright/test 1.58.1->1.58.2, @types/react 19.2.10->19.2.14, typescript-eslint 8.54->8.56).
- Installed major version bumps: `@types/node` ^24->^25, `eslint-plugin-react-refresh` ^0.4->^0.5, `globals` ^16->^17, `jsdom` ^27->^28.
- Attempted ESLint 9->10 and @eslint/js 9->10 but hit `ERESOLVE` peer dependency conflict with `typescript-eslint` (requires eslint ^8.57 or ^9). Skipped.
- Verified: build passes, all 366 tests pass (49 files), lint errors unchanged (39 pre-existing, not regressions), 0 npm audit vulnerabilities (was 1 high before update).
**Outcome:** Success. All non-blocked dependencies updated. ESLint 10 deferred.
**Insight:** Always check `npm outdated` to distinguish semver-compatible from major bumps. Attempt major bumps together but be ready to back off individual packages on peer conflicts. Verify lint error count before and after to confirm no regressions.
**Promoted to Lessons Learned:** Yes (ESLint 10 constraint, npm outdated workflow)

---

### [2026-02-17] Migrate memory system to two-file format

**Context:** Replaced the observational-memory single-file system (`LESSONS_LEARNED.md` with raw incident buffer, observation log, and reflector cycle) with a two-file system: curated `LESSONS_LEARNED.md` + append-only `ITERATION_LOG.md`.
**What happened:**
- Migrated 11 existing observations from the old format into categorized sections (Architecture, Code Patterns, Testing, Performance, Dependencies).
- Active Guardrails content was dissolved into the categorized lessons (each guardrail traces back to a specific lesson entry).
- Created `ITERATION_LOG.md` as the new temporal journal.
- Updated `AGENTS.md` with the memory & continuous learning workflow.
- Updated `CLAUDE.md` Lessons Loop section to reference both files.
**Outcome:** Success. All prior knowledge preserved, system simplified from 3 sections (buffer/log/reflector) to 2 files with clearer roles.
**Insight:** The old observational-memory format was powerful but required agents to understand a complex 3-phase cycle. The two-file split (curated vs. raw) achieves the same signal/noise separation with less cognitive overhead.
**Promoted to Lessons Learned:** No (process change, not a reusable technical insight)

---

### [2026-02-25] Split large files and fix bugs

**Context:** Data JSON files exceeded the 25KB agent file-loading limit (somatic 59KB, plutchik 62KB, 4 wheel files 26-38KB). Five large components (15-22KB) also needed decomposition.
**What happened:**
- Split somatic `data.json` (59KB) into 5 files by body group (`head`, `torso-front`, `torso-back`, `arms`, `legs`). Initial 4-way split had torso at 25.9KB, so re-split into front/back.
- Split plutchik `data.json` (62KB) into 6 files by category (`primary`, `intensity`, `dyad`, `secondary-dyad`, `tertiary-dyad`, `opposite-dyad`).
- Split 4 oversized wheel files into halves (`happy-1/2`, `angry-1/2`, `sad-1/2`, `fearful-1/2`).
- All model `index.ts` files updated to spread-import split files and re-export merged data. Consumer imports updated to use model index re-exports.
- Split 5 large components: ResultModal (22KB→12KB, extracted ResultsView, ResultModalViews, result-modal-types), App (17KB→15KB, extracted FirstInteractionHint, useReminders hook), GuidedScan (17KB→12KB, extracted GuidedScanPhases), SessionHistory (17KB→8KB, extracted session-history-utils, SessionHistoryPanels), SettingsMenu (15KB→13KB, extracted SettingsToggle).
- Fixed 4 bugs: unhandled promise rejection on daily reminder (`.catch()`), silent storage failure logging (`console.warn`), synthesis `.pop()` mutation replaced with `.at(-1)` + `.slice()` + empty-array guard, `console.error` in production gated behind `import.meta.env.DEV`.
- Updated models and frontend codemaps.
**Outcome:** Success. All 366 tests pass, all data files under 25KB, all components under 15KB.
**Insight:** When splitting data by a natural axis, verify actual sizes — torso body group was 25.9KB which required a secondary split (front/back). Using `.cjs` extensions for Node.js splitting scripts avoided ESM issues per LESSONS_LEARNED.md.
**Promoted to Lessons Learned:** No

---

### 2026-02-27 — Wheel breadcrumb navigation for multi-level selection

**Context:** The Emotion Wheel only allowed selecting level 2 (leaf/tertiary) emotions. Users who felt a broad emotion like "happy" without specificity were forced to pick an arbitrary leaf, producing inauthentic selections.
**What happened:**
- Added `WheelBreadcrumb.tsx` component — absolute overlay at top of visualization area showing drill-down path (e.g., `Happy > Playful`). Tapping any segment selects that emotion and resets to root.
- Added `breadcrumbPath` (derived from parent chain) and `handleBreadcrumbSelect` to `useEmotionModel` hook. Path is computed, not stored — no ModelState changes needed.
- Used `BaseEmotion & { parent?: string }` type assertion in hook since `parent` lives on `WheelEmotion`, not `BaseEmotion`. Generic hook can't import wheel-specific types.
- Added `topInset` parameter to `calculateDeterministicPositions` and `calculateRandomPositions` in `bubble-layout.ts` so bubbles don't spawn under the breadcrumb overlay. Passed through `VisualizationProps`.
- Consulted psychologist agent: multi-level selection is clinically valid. Forced leaf selection can produce inauthentic data for alexithymic users or those experiencing broad undifferentiated states.
- UX expert recommended absolute overlay positioning (same pattern as `FirstInteractionHint`) to avoid layout shift / ResizeObserver issues. This was critical given the user's note about visibility issues when space changed.
- Added i18n strings for en/ro. Added 9 tests (path derivation, breadcrumb selection, duplicate prevention).
**Outcome:** Success. 374 tests pass, build succeeds, typecheck clean.
**Insight:** When a generic hook needs to access model-specific fields (like `parent`), use inline type assertion rather than importing model-specific types to preserve the hook's model-agnostic design. Derived state (walking parent chains) is preferable to stored state for simple hierarchies.
**Promoted to Lessons Learned:** No

---

### 2026-02-27 — Expand Emotion Wheel with 53 new leaf-level emotions

**Context:** The emotion wheel had 165 emotions (7 L0 root, 41 L1 intermediate, 117 L2 leaf). User requested analysis by psychologist agents per emotion family to identify gaps and add new leaf-level emotions that make sense in both English and Romanian.
**What happened:**
- Launched 7 psychologist sub-agents (one per emotion family: Happy, Surprised, Bad, Fearful, Angry, Disgusted, Sad) to analyze gaps in emotional granularity.
- Agents returned ~65 candidates. After conflict resolution (9 cross-family ID collisions resolved via suffix patterns, different RO labels, or drops), finalized 53 new L2 emotions.
- Added entries across all 11 data files: happy-1 (+7), happy-2 (+3), surprised (+4), bad (+6), fearful-1 (+4), fearful-2 (+4), angry-1 (+3), angry-2 (+7), disgusted (+5), sad-1 (+6), sad-2 (+4).
- Each entry includes bilingual labels, adaptive descriptions (~100-150 words each in RO/EN), needs, correct color matching siblings, parent reference, and parent children array update.
- Zero code changes — the spread-operator auto-discovery in `index.ts` picks up all new JSON entries automatically.
- Created `IMPROVEMENT_PLAN.md` documenting multi-tree emotion membership (emotions belonging to multiple parent families) as a future architectural improvement, with 11 specific cross-family duplicate observations.
- Key conflict resolutions: `depleted` uses "Secatuit" (RO) to avoid collision with `drained/Epuizat`; `exposed_sad` and `helpless_sad` use suffix pattern to avoid collisions with fearful equivalents; `self_critical` (Angry) vs `self_blaming` (Sad) differentiated by focus.
- Special description care: "obsessive" framed as transient anxiety loop not OCD; "burned_out" as emotional state not clinical syndrome; "passive_aggressive" as learned communication strategy; "self_loathing" validates while encouraging professional support.
**Outcome:** Success. 374 tests pass (49 files), all parent-child bidirectionality validated, no duplicate IDs, no orphans. Total emotions: 165 → 218.
**Insight:** When adding emotions across families, always check for ID collisions across all 11 data files first. The suffix pattern (e.g., `embarrassed_sad`, `exposed_sad`) is the established convention for same-concept-different-context emotions. Romanian labels need extra care for compound phrases (e.g., "Tratat cu condescendenta" for patronized is long but necessary).
**Promoted to Lessons Learned:** No

---

<!-- New entries go above this line, most recent first -->
