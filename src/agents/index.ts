import type { AgentConfig } from "@opencode-ai/sdk/v2"
import { askPrompt } from "./prompts/ask";
import { buildPrompt } from "./prompts/build"
import { buildDocumentPrompt } from "./prompts/build/document"
import { documentConventionsPrompt } from "./prompts/build/document/conventions"
import { documentDesignPrompt } from "./prompts/build/document/design"
import { documentInstallPrompt } from "./prompts/build/document/install"
import { documentPrdPrompt } from "./prompts/build/document/prd"
import { documentReadmePrompt } from "./prompts/build/document/readme"
import { documentSecurityPrompt } from "./prompts/build/document/security"
import { documentUxPrompt } from "./prompts/build/document/ux"
import { executePrompt } from "./prompts/execute";
import { planPrompt } from "./prompts/plan"

type ModelTier = "fast" | "balanced" | "smart"
type AgentConfigWithTier = AgentConfig & { tier?: ModelTier }
type AgentMap = Record<string, AgentConfigWithTier>

/**
 * read-only = green
 * writable = red
 * blue = extra fast (skip layers)
 */

export const agents: AgentMap = {
    ask: {
        color: "#40FF80",
        description: "Generate reports (read-only)",
        mode: "primary",
        permission: {
            "*": "deny",
            question: "allow",
            read: "allow",
            skill: {
                "*": "deny",
                "plan*": "allow",
            },
            task: {
                "*": "deny",
                "query*": "allow",
            },
            "todo*": "allow"
        },
        prompt: askPrompt,
        tier: "smart",
    },

    build: {
        color: "#FF4040",
        description: "Build planned phases",
        hidden: false, // "false" required by Plannotator
        mode: "primary",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            plan_enter: "allow",
            question: "allow",
            task: {
                "*": "deny",
                "build*": "allow",
            }
        },
        prompt: buildPrompt,
        temperature: 0.4,
        tier: "smart",
    },

    build_document: {
        color: "#802020",
        description: "Task `document` to keep project documentation up to date",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "allow",
            task: {
                "*": "deny",
                "document_*": "allow"
            },
            "todo*": "allow",
        },
        prompt: buildDocumentPrompt,
        temperature: 0.1,
        tier: "balanced",
    },

    document_conventions: {
        color: "#802020",
        description: "Task `document_conventions` to document naming conventions and project terminology",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "allow",
            edit: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            lsp: "allow",
            read: "allow",
        },
        prompt: String(documentConventionsPrompt),
        temperature: 0.3,
        tier: "fast",
    },

    document_design: {
        color: "#802020",
        description: "Task `document_design` to document technical architecture and design decisions",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "allow",
            edit: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            lsp: "allow",
            read: "allow",
        },
        prompt: documentDesignPrompt,
        temperature: 0.3,
        tier: "fast",
    },

    document_install: {
        color: "#802020",
        description: "Task document_install to document project installation and usage guide",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "allow",
            edit: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            read: "allow",
        },
        prompt: documentInstallPrompt,
        temperature: 0.3,
        tier: "fast",
    },

    document_prd: {
        color: "#802020",
        description: "Task `document_prd` to document product requirements and user roles",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "allow",
            edit: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            lsp: "allow",
            read: "allow",
        },
        prompt: String(documentPrdPrompt),
        temperature: 0.3,
        tier: "fast",
    },

    document_readme: {
        color: "#802020",
        description: "Task `document_readme` to document README.md and AGENTS.md",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "allow",
            edit: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            read: "allow",
        },
        prompt: documentReadmePrompt,
        temperature: 0.3,
        tier: "fast",
    },

    document_security: {
        color: "#802020",
        description: "Task `document_security` to document security architecture",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "allow",
            edit: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            lsp: "allow",
            read: "allow",
        },
        prompt: documentSecurityPrompt,
        temperature: 0.3,
        tier: "fast",
    },

    document_ux: {
        color: "#802020",
        description: "Task `document_ux` to document UX flows, navigation, and styling patterns",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "allow",
            edit: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            lsp: "allow",
            read: "allow",
        },
        prompt: documentUxPrompt,
        temperature: 0.3,
        tier: "fast",
    },

    execute: {
        color: "#FF4080",
        description: "Execute basic tasks without analysis or planning",
        hidden: false,
        mode: "primary",
        permission: {
            "*": "deny",
            question: "allow",
            read: "allow",
            skill: {
                "*": "allow",
                "code*": "deny"
            },
            submit_plan: "allow",
            task: {
                "*": "allow",
                ask: "deny",
                build: "deny",
                build_init: "deny",
                build_recover: "deny",
                build_retry: "deny",
                build_revise: "deny",
                plan: "deny",
            },
            "todo*": "allow"
        },
        prompt: executePrompt,
        tier: "smart",
    },

    plan: {
        color: "#40FF40",
        description: "Interactive Planning - Interview user, research problem, and create implementation plans",
        mode: "primary",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            plan_exit: "allow",
            read: "allow",
            skill: {
                "*": "deny",
                "plan*": "allow",
            },
            submit_plan: "allow",
            task: {
                "*": "allow",
                "build*": "deny"
            },
        },
        prompt: planPrompt,
        temperature: 0.7,
        tier: "smart",
    },

    explore: {
        disable: true,
    },

    general: {
        disable: true,
    },
}
