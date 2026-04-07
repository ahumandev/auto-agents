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

type CommandMap = Record<string, {
    template: string
    description?: string
    agent?: string
    model?: string
    subtask?: boolean
}>

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

    "resume": {
        description: "Resume interrupted session",
        template: `
<RESUME_PROMPT>
You had been interrupted. Recursively resume every interrupted \`task\` tool call with these steps:

1. Check if last \`task\` tool calls were completed or interrupted? 
2. If interrupted, check if \`task_id\` is available:
    - \`task_id\` was found: Call last \`task\` again with same input parameters \`subagent_type\` (subagent name) and \`task_id\` (session id), but use this very same \`RESUME_PROMPT\` block as input parameter to resume existing task
    - \`task_id\` is unknown: Call last \`task\` again with **ALL SAME** input parameters \`subagent_type\` (subagent name) and \`task_id\` (session id) and \`prompt\` to start fresh task
3. Wait until all \`task\` calls (subagents) completed.
4. Only resume your own work after all sub-tasks of subagents completed.
</RESUME_PROMPT>
`
    },

}
