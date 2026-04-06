---
name: plan_conventions
description: Use this skill to decide on a name of variable, class, file, system object, label or command; Use this skill also to understand acronyms and project definitions to avoid ambiguous wording. 
---

# Project Conventions

## Internal Acronyms
- **PRD**: Product requirements document used by the plan agent skill.
- **UX**: User experience flow and styling documentation scope.

## Definitions
- **Primary agent**: Top-level agent users switch to directly, such as `ask`, `plan`, `build`, or `execute`.
- **Subagent**: Delegated specialist with `mode: "subagent"` and a task-style name.
- **Managed skill**: Built-in skill defined in `src/skills/**` and generated into a temporary `SKILL.md` file.
- **Generated skills root**: Temp directory `autocode-opencode-skills` where built-in skills are materialized.
- **Documentation agent**: `document_*` subagent that owns one project-memory doc file.
- **Agentic memory docs**: Project docs under `.opencode/skills/plan/**/SKILL.md` maintained for agents, not end users.
- **Dev shim**: `.opencode/plugin/autocode.ts`, a local-only re-export of the built plugin.

## Naming Rules
### Agent Families
**Why:** Prefixes encode role and permissions.
**Pattern:** User-facing primaries use bare verbs/nouns (`ask`, `plan`, `build`, `execute`). Delegated specialists are snake_case family names: `build_*` for implementation orchestration, `query_*` for read-only retrieval, `execute_*` for direct action, and `document_*` for project-memory docs.

### Documentation Agent Ownership
**Why:** Each memory file has a single canonical maintainer.
**Pattern:** `document_<topic>` owns `.opencode/skills/plan/<topic>/SKILL.md`; examples: `document_conventions` → `plan/conventions/SKILL.md`, `document_prd` → `plan/prd/SKILL.md`.

### Prompt Export Names
**Why:** Prompt constants mirror agent identifiers predictably.
**Pattern:** Prompt exports use the agent/topic name plus `Prompt`: `buildFeaturePrompt`, `queryCodePrompt`, `documentConventionsPrompt`, `executePrompt`, `planPrompt`, `askPrompt`.

### Prompt File Layout
**Why:** File paths mirror agent namespace depth.
**Pattern:** Primary prompts live directly under `src/agents/prompts/` (`ask.ts`, `plan.ts`, `build.ts`, `execute.ts`). Specialist prompts live in namespace folders like `build/feature.ts`, `query/code.ts`, `execute/document/conventions.ts`.

### Planning Phase Vocabulary
**Why:** Plan output and build delegation depend on fixed phase labels.
**Pattern:** Planning uses category names exactly as written in `plan.ts`: `feature`, `refactor`, `troubleshoot`, `research`, `automate`, `draft`, `brainstorm`, `document`, `verification`, `general`. Phase names should be prefixed with one of these categories.

### Skill Names and Paths
**Why:** Built-in skills are generated from metadata, not stored directly at their runtime location.
**Pattern:** Managed skill names use `<domain>_<topic>` (`author_article`, `test_jest`). Their runtime markdown path is built from `directory` segments plus `SKILL.md`, for example `directory: ["author", "article"]` → `author/article/SKILL.md`.

### Generated Skill Injection
**Why:** Built-in skills must override path order without duplicating entries.
**Pattern:** `injectGeneratedSkillsPath()` prepends the generated skills root to `cfg.skills.paths` and removes duplicate occurrences of that same generated path only.

### Model Tier Keys
**Why:** Agent configs rely on a small fixed capability vocabulary.
**Pattern:** `tier` is always one of `smart`, `balanced`, or `fast`.

### Agent Color Semantics
**Why:** Colors are used as role cues, not arbitrary decoration.
**Pattern:** `src/agents/index.ts` documents `read-only = green`, `writable = red`, and `blue = orchestrators`; concrete families follow that legend (`query_*` green, many write-capable agents red-toned, top-level orchestrators blue/cyan/magenta).

### Package Naming Split
**Why:** Repo and plugin names differ in a non-obvious way.
**Pattern:** The npm package is named `autocode`, while the plugin entry comments and local `.opencode` setup refer to it as the Autocode plugin for OpenCode.

**IMPORTANT**: Update this file whenever new naming conventions or domain terms are introduced.
