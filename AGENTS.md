OpenCode plugin for agent orchestration, generated skills, and memory-document maintenance.

## *REQUIRED* Reading
- [Installation and Usage Documentation](INSTALL.md)
- [Security Documentation](SECURITY.md)

## Project Map
- Entry plugin: `src/plugin.ts`
- Agent registry: `src/agents/index.ts`
- Managed skill generator: `src/skills/index.ts`
- Agent memory docs: `.opencode/skills/plan/**`

## Primary Agents
- `ask` - read-only research and reporting
- `plan` - interview, research, and submit plans before implementation
- `build` - execute approved plans via delegated `build_*` phases
- `execute` - direct-action router for non-planning work

## Specialist Families
- `build_*` - implementation, review, testing, troubleshooting, formatting, fallback execution
- `query_*` - read/query specialists for code, git, text, web, browser, excel
- `execute_*` - direct execution specialists for code, docs, OS, excel, authoring
- `document_*` - maintain agent/project memory docs; `document_readme` owns `README.md` and `AGENTS.md`

## Working Conventions
- Prefer accurate, source-backed docs; do not repeat stale claims from prior revisions.
- Treat this repo as a plugin/library, not a standalone app.
- Preserve deny-by-default permission intent when documenting or changing agent behavior.
- User config may override bundled agent definitions; document defaults as defaults.
- Managed skills are generated at runtime into the OS temp dir `autocode-opencode-skills` and then prepended to OpenCode skill paths.
- Keep end-user docs in root markdown files; agent memory belongs under `.opencode/skills/plan/`.

## Documentation Notes
- `README.md` should stay human-readable and tutorial-style.
- `AGENTS.md` should stay concise and optimized for contributors/operators.
- If adding markdown links, link only to repo-local markdown files that exist.
- This repo currently has no frontend UX surface; avoid implying pages, routes, or styling systems.

## Review Focus Areas
- Permission changes in `src/agents/index.ts`, especially broad access such as `build_general` and `execute_os`
- Prompt/agent naming consistency across families
- Generated skill behavior and tests
- Drift between root docs and `.opencode/skills/plan/*` memory docs
