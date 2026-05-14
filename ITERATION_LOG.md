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

### [2026-03-29] Maintenance audit after pulled config changes

**Context:** Re-audited the repo after a `git pull` to align the existing agent-memory system with the setup guide without dropping project-specific memory.
**What happened:**
- Slimmed `AGENTS.md` down to bootstrap-only ROM content: refs to `LESSONS_LEARNED.md`, `ITERATION_LOG.md`, `SETUP_AI_AGENT_CONFIG.md`, core constraints, and active sub-agents only.
- Moved non-obvious model data corrections out of `AGENTS.md` into `LESSONS_LEARNED.md`; added a process lesson clarifying the ROM/RAM/log split.
- Replaced overlapping generalist sub-agent `senior-software-engineer.md` with focused `architect.md`.
- Fixed stale `CLAUDE.md` references inside `code-simplifier.md`.
- Added missing `SETUP_AI_AGENT_CONFIG.md` and `.github/pull_request_template.md`.
**Outcome:** Success. Memory layers clearer, stale references removed, missing maintenance artifacts added.
**Insight:** After config files already exist, setup work should behave like a maintenance migration, not a reset. Preserve durable lessons; only move them to the right layer.
**Promoted to Lessons Learned:** Yes

---

### [2026-03-16] Periodic maintenance audit of agent config files

**Context:** Applied SETUP_AI_AGENT_CONFIG.md periodic maintenance protocol to audit all config files against the research-backed guide.
**What happened:**
- Audited AGENTS.md: added `work style: telegraph` directive, removed discoverable project description (already in README), added `Legacy & Deprecated` section, added periodic maintenance reference, added file paths to sub-agents table, condensed to template structure. Went from ~73 lines to ~65 lines.
- Audited LESSONS_LEARNED.md: condensed verbose "How to Use" section to match template's compact format. All 11 active lessons retained — all still relevant.
- Audited ITERATION_LOG.md: 5 entries since last maintenance (2026-02-17 to 2026-02-27). No unhandled patterns detected — all promotable insights were already handled.
- Audited sub-agents: 6 agents. 3 under 100-line limit (agent-creator 65, planner 70, code-simplifier 85). 3 over limit (psychologist 130, senior-software-engineer 126, ux-expert 176). Flagged ux-expert as most bloated but preserved domain-specific content that earns its place per SkillsBench research.
- Cross-file consistency: zero overlap between AGENTS.md and LESSONS_LEARNED.md. Sub-agents table matches `.claude/agents/` directory. All file references valid.
**Outcome:** Success. Config files leaner, aligned with guide template. No content lost.
**Insight:** The 100-line limit for sub-agents is a guideline, not a hard rule — domain-specific advisory agents (psychologist, ux-expert) carry knowledge that isn't model-native or codebase-discoverable. Trimming would lose curated value.
**Promoted to Lessons Learned:** No

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

### [2026-04-11] Fix GitHub Actions npm ci failure from Vitest peer mismatch

**Context:** GitHub Pages deploy run `24269632901` failed during `npm ci` with `ERESOLVE` because `vitest` was bumped to `^4.1.2` while `@vitest/coverage-v8` stayed on `^4.0.18`.
**What happened:**
- Read `LESSONS_LEARNED.md` first; then checked local repo and found it stale versus remote `main`, so fetched `origin/main` and switched to a fix branch from the failing revision.
- Confirmed remote `package.json`/`package-lock.json` mismatch via `gh api`: root requested `vitest ^4.1.2` but `@vitest/coverage-v8 ^4.0.18`, and the lockfile still carried `@vitest/coverage-v8` peer `vitest 4.0.18`.
- Updated `package.json` to `@vitest/coverage-v8 ^4.1.2`, regenerated `package-lock.json`, then verified with fresh `npm ci`, `npm test`, and `npm run build`.
**Outcome:** Success. `npm ci` now passes locally; tests passed (`52` files, `396` tests) and production build succeeded.
**Insight:** For Vitest upgrades, helper packages like `@vitest/coverage-v8` need to stay on the same release line as `vitest` or CI will fail before tests even start.
**Promoted to Lessons Learned:** Yes

---

---

### [2026-05-05] Safety hardening: modal portals, external-link consent, deterministic crisis time, focus trap drift

**Context:** Implement 4 high-priority audit tasks (overlay safety, privacy gate, trap robustness, deterministic crisis semantics).
**What happened:**
- Refactored `ModalShell` to always render through `createPortal(..., document.body)` with SSR-safe fallback.
- Added explicit external AI consent setting (`allowExternalAI`) in storage + App state + Settings UI; default remains off; Result modal hides outbound CTA when off and shows explanation copy.
- Extended EN/RO i18n with external-link consent labels and disabled-state messaging.
- Hardened `useFocusTrap` against focus drift (Tab when active element outside trap now rehomes to first/last focus target).
- Refactored temporal crisis functions to accept optional `nowMs` injection for deterministic boundary testing; expanded tests for exact 7-day cutoff behavior.
- Updated tests for new settings props and external-link gating; all targeted tests pass.
**Outcome:** Success.
**Insight:** One shared modal primitive with internal portalization gives low-change, high-leverage compliance across all overlays and keeps behavior consistent.
**Promoted to Lessons Learned:** No

### [2026-05-07] Tighten temporal crisis escalation coverage

**Context:** Hourly maintenance pass. Temporal crisis logic is safety-critical and already has deterministic boundary tests; a missing escalation case was a low-risk, useful regression guard.
**What happened:**
- Added a regression test proving `escalateCrisisTier('tier2', ...)` advances to `tier3` when the temporal high-distress threshold is met.
- Verified the focused temporal crisis test file after installing dependencies with `npm ci`.
**Outcome:** Success. Behavior unchanged; coverage slightly stronger.
**Insight:** Tier-by-tier escalation deserves explicit coverage, especially in crisis-gating code where auditable behavior matters.
**Promoted to Lessons Learned:** No

---

### [2026-05-11] Repo sweep: keep tests green during branch audit

**Context:** Ran a one-by-one test sweep across the repos under `/workspace/git` on the current branch.
**What happened:** Verified `npm test` in `emot-id` failed, traced it to Romanian translation keys missing from the completeness check, added the missing `groundingTitle`, `groundingBody`, and `bridges.cognitiveFromDimensional` entries in `src/i18n/ro.json`, and re-ran the suite successfully.
**Outcome:** Success — `npm test` passes and the repo is left with only the intended tracked edit.
**Insight:** Translation completeness tests are easiest to satisfy by restoring the missing source-of-truth keys instead of weakening the check.
**Promoted to Lessons Learned:** No

---

### [2026-05-11] Polish dimensional copy in EN/RO

**Context:** Small maintenance pass on the locale strings for the dimensional model.
**What happened:** Corrected Romanian typos in the dimensional prompts and aligned both locales around clearer pleasantness/intensity wording in `src/i18n/en.json` and `src/i18n/ro.json`.
**Outcome:** Success. Copy is cleaner, and the i18n completeness test still passes.
**Insight:** Locale text drifts are easiest to catch when the paired EN/RO strings stay semantically parallel instead of only matching key sets.
**Promoted to Lessons Learned:** No

---

### [2026-05-12] Document default-off external AI links in README

**Context:** Small maintenance pass after reviewing the privacy-facing UI copy.
**What happened:** Updated `README.md` so the "Explore further" line now states that external AI links stay off by default, matching the consent-gated outbound behavior in the app.
**Outcome:** Success. Documentation now reflects the opt-in privacy boundary more accurately.
**Insight:** When a feature can send user-selected content outside the app, the README should call out the default-off state explicitly so the privacy story stays aligned with the UI.
**Promoted to Lessons Learned:** No

---

### [2026-05-12] Hide DimensionalField axis labels after first mobile interaction

**Context:** Follow-up polish from the UX action plan. The dimensional view keeps axis labels visible even after the user has already interacted, which can keep priming the user on mobile.
**What happened:**
- Added mobile detection in `DimensionalField` with a `hasInteracted` gate.
- Hid the axis labels after the first field, dot, or suggestion interaction on mobile only; desktop stays unchanged.
- Added a focused regression test that mocks `matchMedia` and proves the labels disappear after the first mobile interaction.
**Outcome:** Success. Mobile-only guidance is less persistent, and the existing desktop behavior remains intact.
**Insight:** For small UX gates, make the trigger explicit and keep the desktop path stable; a focused viewport-specific regression test is enough to lock the boundary.
**Promoted to Lessons Learned:** No

---

### [2026-05-13] Align crisis temporal note copy

**Context:** Small maintenance pass on the crisis banner temporal-note copy.
**What happened:**
- Fixed the Romanian `crisis.temporalNote` typo in `src/i18n/ro.json`.
- Aligned the English `crisis.temporalNote` copy in `src/i18n/en.json` and the CrisisBanner fallback string in `src/components/CrisisBanner.tsx` so the runtime default matches the locale text.
- Verified with the focused i18n completeness test and a production build.
**Outcome:** Success. User-facing copy is clearer and the fallback stays in sync.
**Insight:** When a locale string is also used as a runtime fallback, update the component default together with the translation files to avoid drift.
**Promoted to Lessons Learned:** No

---

### [2026-05-13] Refresh test-count doc and fix ResultModal temporal-note assertion

**Context:** Small maintenance pass during autopilot. The repo docs still mentioned an older test count, and one ResultModal regression test no longer matched the actual crisis-banner fallback copy.
**What happened:**
- Updated `ANALYSIS.md` to report the current Vitest inventory: 400 tests across 52 files.
- Adjusted `src/__tests__/ResultModal.test.tsx` to assert the current temporal-note copy (`pattern appearing more often lately`).
- Verified with `npm test` after the change.
**Outcome:** Success. Documentation is current and the full suite passes again.
**Insight:** When a runtime copy string drifts, fix the assertion to the live contract unless the product text itself is the thing that needs changing.
**Promoted to Lessons Learned:** No

---

### [2026-05-13] Announce timed micro-intervention phases for assistive tech

**Context:** Small accessibility pass on the timed micro-intervention flow. The breathing and savoring prompts change text over time, but the changing phase text was not explicitly exposed as a live region.
**What happened:**
- Added `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` to the breathing phase text in `src/components/MicroIntervention.tsx`.
- Added the same live-region attributes to the savoring step text so both timed prompts announce updates consistently.
- Added focused tests that render each timed prompt and assert the live-region contract.
- Verified with `npm exec vitest -- run src/__tests__/MicroIntervention.test.tsx` and `npm run build`.
**Outcome:** Success. The timed intervention prompts are now more screen-reader friendly without changing visible behavior.
**Insight:** Any prompt that updates on a timer should expose the changing instruction as a status region, otherwise assistive tech can miss the phase transitions entirely.
**Promoted to Lessons Learned:** No

---

### [2026-05-13] Retitle stale IMPROVEMENT_PLAN reference in analysis doc

**Context:** Small docs cleanup during autopilot. `ANALYSIS.md` still referred to a nonexistent `TODOS.md` section even though the repo now tracks future work in `IMPROVEMENT_PLAN.md`.
**What happened:**
- Retitled the `ANALYSIS.md` section from `TODOS.md Disposition` to `Improvement Plan Disposition`.
- Replaced the remaining `TODOS.md: Implements ...` references in that section with `IMPROVEMENT_PLAN.md: Implements ...`.
**Outcome:** Success. The analysis doc now points at the real planning artifact instead of a dead filename.
**Insight:** When a repo’s follow-up work has moved from ad hoc TODOs into a named plan file, update the narrative docs to match the live artifact so future agents do not chase a file that does not exist.
**Promoted to Lessons Learned:** No

---

### [2026-05-14] Refresh test-count doc to match live Vitest inventory

**Context:** Small docs sync during autopilot. The analysis doc still reported the previous Vitest inventory after the suite grew by two tests.
**What happened:**
- Re-checked the live Vitest inventory with `npm exec vitest -- list --json` and confirmed 402 tests across 52 files.
- Updated `ANALYSIS.md` to reflect the current count.
**Outcome:** Success. Documentation now matches the observed test inventory.
**Insight:** When a count is used as a health signal in docs, verify it with the cheapest live inventory probe before editing and keep the number exact.
**Promoted to Lessons Learned:** No

---

### [2026-05-14] Clarify sound setting copy in EN/RO and README

**Context:** Small copy maintenance pass. The settings section still used the vague label "Sound effects", and the README had a typo in the sound-feedback bullet.
**What happened:**
- Renamed `settings.soundLabel` to `Sound` in `src/i18n/en.json` and `Sunet` in `src/i18n/ro.json`.
- Added focused `SettingsMenu` coverage for the sound section label in both English and Romanian.
- Reworded the README bullet to say the sound feedback "can be muted" instead of "mutable".
- Verified with focused Vitest runs for `SettingsMenu` and i18n completeness.
**Outcome:** Success. The settings copy is clearer and the docs now match the actual mute toggle.
**Insight:** Short, concrete labels work better for toggle sections; if a control is binary, the label should name the thing, not the effect.
**Promoted to Lessons Learned:** No

---

<!-- New entries go above this line, most recent first -->
