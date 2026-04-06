# Installation

## Prerequisites
- Bun
- OpenCode with plugin support

## Setup Steps
1. Install dependencies: `bun install`
2. Build the plugin: `bun run build`
3. Add the built plugin to your OpenCode config in `opencode.jsonc`: `{ "plugin": ["file:///absolute/path/to/auto-agents/dist/plugin.js"] }`
4. For a published package install, use the package name in `opencode.jsonc`: `{ "plugin": ["@autocode-ai/plugin"] }`

## Running the Application
1. For development rebuilds, run: `bun run watch`
2. Load the plugin through OpenCode; this project does not start a standalone server or expose a default URL.
3. On load, the plugin writes managed skills to your system temp directory under `autocode-opencode-skills` and prepends that path to `cfg.skills.paths`.

## Running Tests
1. Run the test suite: `bun test`
2. Run type checks: `bun run typecheck`

## Non-Standard Dependencies
- **@opencode-ai/plugin**: Plugin entrypoint and lifecycle integration for OpenCode.
- **@opencode-ai/sdk**: OpenCode config and agent type definitions.
- **gray-matter**: Parses frontmatter in generated skill tests.
