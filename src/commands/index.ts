import type { Config } from "@opencode-ai/sdk/v2"

/**
 * Command definitions for the Autocode plugin.
 *
 * Commands are registered programmatically via the `config` hook so they are
 * self-contained in the npm package — no Markdown files need to be copied or
 * referenced from the filesystem by the end user.
 *
 * Each entry matches the Config.Command schema:
 *   { template, description?, agent?, model?, subtask? }
 *
 * The `.opencode/command/` files in this repo are the LOCAL DEV equivalent —
 * opencode loads them from disk when running from the project root.
 * When deployed as a npm package, only this file is used.
 */

type CommandMap = NonNullable<Config["command"]>

export const commands: CommandMap = {

    "backlog": {
        agent: "plan",
        description: "Plan a backlog item",
        template: "List backlog items with `autocode_backlog_list` tool.",
    },

    "document": {
        agent: "execute_document",
        description: "Documentation the entire project",
        template: "Perform a comprehensive documentation update for the entire project.",
    },

    "document_conventions": {
        agent: "document_conventions",
        description: "Document the project's naming conventions and terminology",
        template: "$ARGUMENTS",
    },

    "document_design": {
        agent: "document_design",
        description: "Document the project's technical architecture and design decisions",
        template: "$ARGUMENTS",
    },

    "document_prd": {
        agent: "document_prd",
        description: "Document the project's product requirements and user roles",
        template: "$ARGUMENTS",
    },

    "document_ux": {
        agent: "document_ux",
        description: "Document the project's UX flows, navigation, and styling patterns",
        template: "$ARGUMENTS",
    },

    "git_conflict": {
        agent: "git_conflict",
        description: "Automatically handle git merge conflicts",
        template: "$ARGUMENTS",
    },

    "resume": {
        agent: "execute",
        description: "Resume interrupted session",
        template: "You were interrupted. Call \`task_resume\` tool, then resume your own work."
    },

}
