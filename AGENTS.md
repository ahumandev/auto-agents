# Project Purpose
Bundle OpenCode agents, commands, and generated skills for planning, execution, research, and documentation.

# User Roles
- **OpenCode host**: Loads bundled defaults without manual agent or command wiring.
- **OpenCode user**: Uses `ask`, `plan`, `build`, and `execute` for guided work.
- **Planner/researcher**: Uses planning and query flows before implementation.
- **Operator/executor**: Runs approved plans or direct actions through scoped subagents.
- **Documentation maintainer**: Keeps memory and root docs aligned with repo facts.

# Primary Features
- **Config injection**: Merge bundled agents and commands @ `src/plugin.ts`
- **Primary agents**: Orchestrate ask, plan, build, execute @ `src/agents/index.ts`
- **Specialist subagents**: Scope build, query, execute, document tasks @ `src/agents/index.ts`
- **Bundled commands**: Register document and resume commands @ `src/commands/index.ts`
- **Managed skills**: Generate `author_*` and `test_*` skills @ `src/skills/index.ts`
- **Resume tool**: Resume interrupted delegated sessions @ `src/tools/task_resume.ts`

# Architecture
- **Plugin entry**: TypeScript OpenCode plugin @ `src/plugin.ts`
- **Agent registry**: TypeScript agent and permission catalog @ `src/agents/index.ts`
- **Agent prompts**: TypeScript prompt sources @ `src/agents/prompts/`
- **Command registry**: TypeScript command definitions @ `src/commands/index.ts`
- **Managed skills**: TypeScript generated-skill sources @ `src/skills/`
- **Tool extensions**: TypeScript runtime tools @ `src/tools/`
- **Agent memory docs**: Markdown planning memory @ `.opencode/skills/plan/`

# File Structure
- `.opencode/plugin/autocode.ts`: Local dev shim to dist plugin
- `.opencode/opencode.jsonc`: Local OpenCode config schema file
- `src/skills/index.test.ts`: Tests generated skill injection
- `src/tools/index.test.ts`: Tests task resume wiring

# Rules
- Treat this repo as opencode plugin, not a standalone app.
