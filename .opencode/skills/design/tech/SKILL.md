---
name: design_tech
description: Use this skill before implementing any feature to understand the project's technical design and standards.
---

# Technical Design

## Architectural Overview
Autocode is a Bun/TypeScript OpenCode plugin. On load, `src/plugin.ts` generates bundled skills into an OS temp directory, prepends that path to `cfg.skills.paths`, and merges default agents and commands into the host OpenCode config while preserving user overrides.

## Technology Choices
- **Bun**: Build, watch, and test runtime for the plugin package.
- **TypeScript**: Types plugin hooks, agent configs, and session/tool logic.
- **@opencode-ai/plugin**: Provides plugin lifecycle and custom tool registration.
- **@opencode-ai/sdk/v2**: Defines `Config`, `AgentConfig`, and permission shapes.
- **gray-matter**: Test-only frontmatter parsing for generated skill validation.

## Key Data Models
- **ManagedSkillDefinition** (`src/skills/index.ts`): Runtime skill metadata with name, directory, and Markdown content.
- **managedSkills** (`src/skills/index.ts`): Canonical generated author/test skill registry.
- **AgentConfigWithTier** (`src/agents/index.ts`): Agent config plus `smart`/`balanced`/`fast` tier.
- **AgentMap** (`src/agents/index.ts`): Registry for all primary and subagent defaults.
- **Candidate** (`src/tools/task_resume.ts`): Resumable child session plus timestamp and prompt context.
- **ResumeState** (`src/tools/task_resume.ts`): Tracks resumed sessions, visited nodes, and resume errors.

## Key API Endpoints
- **No HTTP endpoints confirmed**: Public integration points are plugin hooks, commands, agents, and the `task_resume` tool.
- **`config()` hook** (`src/plugin.ts`): Injects skills, agents, and commands.
- **`task_resume` tool** (`src/tools/task_resume.ts`): Resumes interrupted descendant task sessions.
- **`resume` command** (`src/commands/index.ts`): Routes to `execute` and instructs `task_resume` use.

## Error Handling
- **`ensureGeneratedSkills`** (`src/skills/index.ts`): Startup skill writes fail by propagating filesystem errors.
- **`injectGeneratedSkillsPath`** (`src/skills/index.ts`): Deduplicates generated skill path on repeated config merges.
- **`createTaskResumeTool`** (`src/tools/task_resume.ts`): Distinguishes no-candidate, partial-error, and fatal-resume outcomes.
- **Tool tests** (`src/tools/index.test.ts`): Verify prompt selection and plugin wiring for resume flows.

## Security Design
No internal auth layer exists. Security is permission-centric: agents mostly default to `"*": "deny"` and receive scoped tool/task allowlists in `src/agents/index.ts`. `query_browser` requires manual user login for authenticated sites, `query_os` forbids destructive commands, and higher-risk defaults include broad `execute_os` access plus `build_general`'s allow-all fallback. User config overrides bundled defaults in `src/plugin.ts`.

## External Integrations
- **OpenCode host config** (`src/plugin.ts`): Merges bundled agents and commands at plugin load — plugin hook.
- **OS temp filesystem** (`src/skills/index.ts`): Writes generated `SKILL.md` files under `tmpdir()` — filesystem.
- **OpenCode session APIs** (`src/tools/task_resume.ts`): Reads child sessions/messages and resumes work with `promptAsync` — SDK client.
- **Chrome DevTools tools** (`src/agents/index.ts`, `src/agents/prompts/query/browser.ts`): Browser inspection and manual-login-assisted verification — browser tools.
- **Git / Web / Excel / Bash tools** (`src/agents/index.ts`): Delegated specialist capabilities by permission map — runtime tools.

## Known Risks & Anti-Patterns
- **`build_general` fallback**: `"*": "allow"` broadens privileges when specialization fails.
- **Broad OS executor**: `execute_os` can use bash, pty, filesystem, and external directories.
- **Prompt-first orchestration**: Behaviour lives mostly in prompts, reducing hard runtime guarantees.
- **Ephemeral generated skills**: Tempdir output must be regenerated outside the repo.
- **User override precedence**: Host config can weaken bundled default restrictions.

**IMPORTANT**: Update `.opencode/skills/design/tech/SKILL.md` whenever architecture, APIs, data models, security, or integrations change.
