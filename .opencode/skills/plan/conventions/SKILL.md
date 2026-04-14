---
name: plan_conventions
description: Use this skill to decide on a name of variable, class, file, system object, label or command; Use this skill also to understand acronyms and project definitions to avoid ambiguous wording. 
---

# Project Conventions

## Internal Acronyms
- **PRD**: Product requirements document used by the `document_prd` memory flow.

## Definitions
- **Primary agent**: Top-level agent users switch to directly, such as `ask`, `plan`, `build`, or `execute`.
- **Subagent**: Delegated specialist with `mode: "subagent"` and a task-style name.
- **Managed skill**: Built-in skill defined in `src/skills/**` and generated into a temporary `SKILL.md` file.
- **Generated skills root**: Temp directory `autocode-opencode-skills` where built-in skills are materialized.
- **Documentation agent**: `document_*` subagent with one explicitly assigned documentation file.
- **Agentic memory docs**: Project docs under `.opencode/skills/plan/**/SKILL.md` maintained for agents, not end users.
- **Dev shim**: `.opencode/plugin/autocode.ts`, a local-only re-export of the built plugin.

## Naming Rules
### Agent Families
**Purpose:** Prefixes encode role and permissions.
**Pattern:** User-facing primaries use bare names (`ask`, `plan`, `build`, `execute`). Delegated specialists use snake_case family prefixes: `build_*`, `query_*`, `execute_*`, and `document_*`.

### Documentation Agent Ownership
**Purpose:** Each maintained doc has a single canonical owner.
**Pattern:** Ownership is declared centrally in `src/agents/prompts/execute/document.ts`. Examples: `document_conventions` → `.opencode/skills/plan/conventions/SKILL.md`, `document_design` → `.opencode/skills/design/code/SKILL.md`, `document_install` → `.opencode/skills/design/install/SKILL.md`, `document_prd` → `.opencode/skills/plan/prd/SKILL.md`.

### Prompt Export Names
**Purpose:** Prompt constants mirror agent identifiers predictably.
**Pattern:** Prompt exports use the agent/topic name plus `Prompt`: `buildFeaturePrompt`, `queryCodePrompt`, `documentConventionsPrompt`, `executePrompt`, `planPrompt`, `askPrompt`.

### Prompt File Layout
**Purpose:** File paths mirror agent namespace depth.
**Pattern:** Primary prompts live under `src/agents/prompts/` (`ask.ts`, `plan.ts`, `build.ts`, `execute.ts`). Specialist prompts live in namespace folders like `build/feature.ts`, `query/code.ts`, `execute/document/conventions.ts`.

### Verification Build Names
**Purpose:** Verification phases use dedicated review agent names.
**Pattern:** API verification uses `build_review_api`, UI verification uses `build_review_ui`, and test-writing/fixing uses `build_test`.

### Skill Names and Paths
**Purpose:** Built-in skills are generated from metadata, not stored directly at their runtime location.
**Pattern:** Managed skill names use `<domain>_<topic>` (`author_article`, `test_jest`). Their runtime markdown path is built from `directory` segments plus `SKILL.md`, for example `directory: ["author", "article"]` → `author/article/SKILL.md`.

### Generated Skill Injection
**Purpose:** Built-in skills must override path order without duplicating entries.
**Pattern:** `injectGeneratedSkillsPath()` prepends the generated skills root to `cfg.skills.paths` and removes duplicate occurrences of that same generated path only.

### Model Tier Keys
**Purpose:** Agent configs rely on a small fixed capability vocabulary.
**Pattern:** `tier` is always one of `smart`, `balanced`, or `fast`.

### Package Naming Split
**Purpose:** Repo and install package names differ in a non-obvious way.
**Pattern:** The repo/package uses `autocode` (`package.json` name and `.opencode/plugin/autocode.ts`), while installation docs reference the published plugin package as `@autocode-ai/plugin`.

---

**IMPORTANT**: Update `.opencode/skills/plan/conventions/SKILL.md` whenever new naming conventions or domain terms are introduced.
