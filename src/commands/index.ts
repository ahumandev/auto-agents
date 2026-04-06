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

    "code": {
        agent: "execute_code",
        description: "Execute code change task",
        template: `
You can ONLY read or modify code, scripts, config, templates - any other requests should be aborted and ask user to change agent.
`
    },

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

    "excel": {
        agent: "execute_excel",
        description: "Execute Excel task",
        template: `
You can ONLY read or modify Excel spreadsheets - any other requests should be aborted and ask user to change agent.
`
    },

    "author": {
        agent: "execute_author",
        description: "Author a document",
        template: `
You can ONLY read or modify Markdown files - any other requests should be aborted and ask user to change agent.
`
    },

    "os": {
        agent: "execute_os",
        description: "Execute Operating System task",
        template: `
You can ONLY read or modify Operating System configuration files or execute os commands - any other requests should be aborted and ask user to change agent.
`
    },

}
