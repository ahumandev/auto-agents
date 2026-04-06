---
name: plan_design
description: Use this skill before planning or implementing any feature to understand the project's technical architecture, key design decisions, and known risks.
---

# Technical Design

## Architectural Overview
Autocode is a Bun/TypeScript OpenCode plugin. `src/plugin.ts` injects a large permission-scoped agent catalog and prepends generated Markdown skills from a temp directory, so planning, execution, research, and documentation behaviour is driven mostly by prompt files plus OpenCode tool permissions.

## Technology Choices
- **TypeScript + Bun**: Bun builds/tests the plugin; TypeScript types OpenCode config and agents.
- **@opencode-ai/plugin**: Exposes the `config()` hook used to mutate host OpenCode config.
- **@opencode-ai/sdk/v2**: Supplies `Config` and `AgentConfig` shapes for registered agents.
- **Filesystem-generated skills**: Managed skills are written to `tmpdir()` at runtime, not stored prebuilt.
- **Prompt-first architecture**: Most behaviour lives in Markdown-like prompt strings, not imperative orchestration code.
- **gray-matter**: Used only in tests to verify generated skill frontmatter.

## Key API Endpoints
- `plugin.config()`: Injects generated skills path and agent definitions.
- `ask` AGENT: Read-only research orchestrator.
- `plan` AGENT: Interactive planning and `submit_plan` handoff.
- `build` AGENT: Executes approved plans through `build_*` supervisors.
- `execute` AGENT: Immediate-action delegator for non-planned work.
- `execute_document` AGENT: Routes documentation maintenance to `document_*` owners.

## Key Data Models
- **ManagedSkillDefinition** (`src/skills/index.ts`): Runtime-written skill spec with name, description, directory, content.
- **managedSkills** (`src/skills/index.ts`): Canonical generated skill registry for author/test skills.
- **ModelTier** (`src/agents/index.ts`): Shared model tier enum: `fast`, `balanced`, `smart`.
- **AgentConfigWithTier** (`src/agents/index.ts`): OpenCode agent config extended with optional tier metadata.
- **AgentMap** (`src/agents/index.ts`): Complete registry of primary, subagent, and disabled agents.

## Error Handling
- **ensureGeneratedSkills** (`src/skills/index.ts`): `Promise.all` propagates filesystem generation failures during plugin startup.
- **injectGeneratedSkillsPath** (`src/skills/index.ts`): Deduplicates generated skill path to avoid repeated config mutation.
- **skills/index.test.ts** (`src/skills/index.test.ts`): Regression tests verify frontmatter generation and path injection behaviour.

## Security Design
Security is permission-driven, not auth-driven. `src/agents/index.ts` defines mostly deny-by-default tool allowlists per agent. Read-only agents only get query/read tools; mutating agents selectively gain `edit`, `bash`, browser, git, Excel, or web access. Some higher-risk capabilities use `ask`, but `execute_os` explicitly allows broad OS and external-directory access.

## External Integrations
- **OpenCode plugin runtime** (`src/plugin.ts`): Mutates host config with agents and generated skill paths. — plugin hook
- **OpenCode tool permission system** (`src/agents/index.ts`): Agents delegate through allowed runtime tools only. — agent runtime
- **Local temp filesystem** (`src/skills/index.ts`): Writes generated `SKILL.md` files under OS tempdir. — filesystem
- **Git/Chrome/Web/Excel tool channels** (`src/agents/index.ts`): Exposed indirectly via agent permissions and prompts. — delegated tools

## Known Risks & Anti-Patterns
- **Stale design-doc risk**: Previous design doc described nonexistent `src/core`/`src/tools` architecture.
- **Prompt-heavy logic**: Behaviour changes are easy, but runtime guarantees are weak.
- **No explicit startup recovery**: Skill generation failures bubble directly from filesystem writes.
- **Broad OS agent power**: `execute_os` allows bash, pty, filesystem, and external directory access.
- **Tempdir dependency**: Generated skills are ephemeral and recreated outside the repository.
- **Docs/security gaps**: `README.md` is empty and `SECURITY.md` is absent.
- **No custom commands/tools**: Repository currently ships agents and generated skills only.

**IMPORTANT**: Update this file whenever architecture, APIs, data models, security, or integrations change.
