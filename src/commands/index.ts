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

    "document": {
        agent: "execute_document",
        description: "Documentation the entire project",
        template: `
Perform a comprehensive documentation update for the entire project:
        
# INSTRUCTIONS
1. Read existing README.md (if it exists) to understand current project setup.
2. Call ALL \'document_...\' subagents to analyze and update their respective areas.
3. Generate/update AGENTS.md, INSTALL.md, SECURITY.md based on all subagent reports.
4. Task \`document_readme\` subagent to finalize \`README.md\`
`
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

    /**
     * task_resume tool does following:
     * 1. Find current session_id
     * 2. Find all sub-sessions with parent_id = session_id
     * 3. Mark last sub-session as resume candidate if:
     *   - it was potentially interrupted, and
     *   - if last tool call was \`task\`
     * 4. Add remaining sub-sessions as resume candidates if: they too were interrupted within 4 seconds of "resume candidate"
     * 5. For each resume candidate:
     *   - active sub-session with same agent, task_id (sub-session_id) but with prompt "You were interrupted. You MUST use \`task_resume\` tool, then resume your own work"
     */
    "resume": {
        agent: "execute",
        description: "Resume interrupted session",
        template: "You were interrupted. Call \`task_resume\` tool, then resume your own work."
    },

}
