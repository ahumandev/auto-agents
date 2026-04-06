# Security Architecture

## Overview
This project is an OpenCode plugin, not an app with built-in user auth. Its primary security model is agent/tool authorization: each agent gets an explicit permission map that gates file, shell, browser, git, web, and task access. The main trust boundaries are the OpenCode host, the local workspace and OS, external directories, browser sessions, and generated skill files written to a temp directory. User config can override bundled agent definitions.

## Key Components
- [Agent registry](./src/agents/index.ts) - Default permission policy
- [Plugin config hook](./src/plugin.ts) - Injects agents and skills
- [Generated skills](./src/skills/index.ts) - Writes temp skill files
- [Browser query prompt](./src/agents/prompts/query/browser.ts) - Manual-login browser guidance
- [OS executor prompt](./src/agents/prompts/execute/os.ts) - Direct shell execution rules

## Authentication
No internal authentication layer exists in this plugin. For browser/API review flows, prompts instruct the user to authenticate manually or use existing external login/config flows rather than storing credentials in this repo.

## Authorization
Authorization is enforced through per-agent permission maps with `allow`/`deny`/`ask` defaults. Most agents are default-deny; examples include document and query agents. Notable roles: primary orchestrators (`ask`, `build`, `execute`, `plan`), subagents for code/docs/OS tasks, and read-only query agents.

## Security Features
- Default-deny permissions: Most agents start with `"*": "deny"`.
- Scoped delegation: Agents may call only approved subagents/tools.
- Manual auth handling: Browser prompt tells users to log in themselves.
- Read-only browser mode: `query_browser` forbids source-code editing.
- User-consent gates: Some capabilities use `ask` before dangerous actions.
- No embedded secrets: No repo-based env secret loading was found.

## Non-Standard Practices
- **Permission-centric security**: Tool access control replaces app-style auth.
- **Config override precedence**: User `cfg.agent[name]` overrides bundled defaults.
- **Temp skill generation**: Managed skills are materialized under `tmpdir()` at runtime.
- **Direct OS execution**: OS executor prompt minimizes warnings and executes commands on behalf of other agents.
