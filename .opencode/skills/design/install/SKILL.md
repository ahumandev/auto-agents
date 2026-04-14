---
name: design_install
description: Use this skill to understand how to install, setup, run or deploy project in local or production environments.
---

# Local Installation

## Prerequisites

1. Install Bun first because `package.json` scripts use `bun build`, `bun test`, and Bun package installation.
2. Use OpenCode with plugin support because this repository ships a plugin, not a standalone app or server.

## Local Setup Steps

1. Run `bun install` in the repo root because the plugin depends on `@opencode-ai/plugin`, `@opencode-ai/sdk`, `gray-matter`, and TypeScript.
2. Run `bun run build` because it creates `dist/plugin.js`, emits `dist/plugin.d.ts`, and writes the dev shim `~/.config/opencode/plugins/autocode.js`.
   - Expected output example: generated `dist/plugin.js` and `dist/plugin.d.ts` files.
3. Register the built plugin in `opencode.jsonc` because OpenCode must load the compiled entrypoint.
   - Example config:
     ```jsonc
     {
       "plugin": ["file:///absolute/path/to/auto-agents/dist/plugin.js"]
     }
     ```
4. If using the published package instead of a file path, register the package name `autocode` in `opencode.jsonc` because `package.json` names the plugin package `autocode`.
   - Example config:
     ```jsonc
     {
       "plugin": ["autocode"]
     }
     ```

## Startup Steps

1. Run `bun run watch` during development because `.opencode/plugin/autocode.ts` re-exports `../../dist/plugin.js` and expects rebuilds on change.
2. Start or reload OpenCode with the plugin configured because the plugin only runs inside the OpenCode host.
3. Verify plugin load by checking that managed skills are generated under your OS temp directory in `autocode-opencode-skills/.../SKILL.md` because `src/skills/index.ts` writes them at runtime and prepends that path to `cfg.skills.paths`.
   - Expected result example: OpenCode config gains generated skills path before existing skill paths.
4. Use the primary agents `ask`, `plan`, `build`, and `execute` because `src/agents/index.ts` registers them as the main user-facing workflows.

## Common Project Commands/URLs

1. Run `bun run build` because it packages the plugin into `dist/` for OpenCode loading.
2. Run `bun run watch` because it rebuilds the plugin and declarations while developing.
3. Run `bun test` because the repository test suite uses Bun.
4. Run `bun run typecheck` because TypeScript validation is separate from runtime tests.
5. Do not expect a local app URL because the repository has no standalone server, frontend, or default browser route.

# Production Deployment

## Packaging Steps

1. Run `bun install` because packaging requires all Bun and TypeScript dependencies.
2. Run `bun run build` because deployment artifacts are `dist/plugin.js` and `dist/plugin.d.ts`.
3. Publish or distribute the package named `autocode` because `package.json` defines that package identity.

**IMPORTANT**: Update `.opencode/skills/design/install/SKILL.md` whenever project technology, dependencies, installation or deployment processes changes.
