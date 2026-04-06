import type { AgentConfig } from "@opencode-ai/sdk/v2"
import { askPrompt } from "./prompts/ask";
import { buildPrompt } from "./prompts/build"
import { buildDocumentPrompt } from "./prompts/build/document"
import { buildExcelPrompt } from "./prompts/build/excel";
import { buildFeaturePrompt } from "./prompts/build/feature";
import { buildFormatPrompt } from "./prompts/build/format";
import { buildGeneralPrompt } from "./prompts/build/general";
import { buildGitCommitPrompt } from "./prompts/build/git_commit";
import { buildOptimizePrompt } from "./prompts/build/optimize";
import { buildTestPrompt} from "./prompts/build/test";
import { buildTroubleshootPrompt } from "./prompts/build/troubleshoot";
import { documentConventionsPrompt } from "./prompts/build/document/conventions"
import { documentDesignPrompt } from "./prompts/build/document/design"
import { documentInstallPrompt } from "./prompts/build/document/install"
import { documentPrdPrompt } from "./prompts/build/document/prd"
import { documentReadmePrompt } from "./prompts/build/document/readme"
import { documentSecurityPrompt } from "./prompts/build/document/security"
import { documentUxPrompt } from "./prompts/build/document/ux"
import { executePrompt } from "./prompts/execute";
import { planPrompt } from "./prompts/plan"
import { queryBrowserPrompt } from "./prompts/query/browser";
import { queryCodePrompt } from "./prompts/query/code";
import { queryExcelPrompt } from "./prompts/query/excel";
import { queryGitPrompt } from "./prompts/query/git";
import { queryTextPrompt } from "./prompts/query/text";
import { queryWebPrompt } from "./prompts/query/web";
import { osPrompt } from "./prompts/os";

type ModelTier = "fast" | "balanced" | "smart"
type AgentConfigWithTier = AgentConfig & { tier?: ModelTier }
type AgentMap = Record<string, AgentConfigWithTier>

/**
 * read-only = green
 * writable = red
 * blue = orchestrators
 */

const agents: AgentMap = {
    ask: {
        color: "#40FF40",
        description: "Generate reports (read-only)",
        mode: "primary",
        permission: {
            "*": "deny",
            codesearch: "allow",
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
        color: "#FF40FF",
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
        color: "#B030B0",
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

    build_excel: {
        color: "#B03030",
        description: "Task `build_excel` to orchestrate excel workbook manipulations and data validation",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            external_directory: "ask",
            task: {
                "*": "deny",
                "excel_*": "allow",
                query_excel: "allow",
                query_text: "allow"
            },
            "todo*": "allow",
        },
        prompt: buildExcelPrompt,
        temperature: 0.3,
        tier: "balanced",
    },

    build_feature: {
        color: "#B03030",
        description: "Task `build_feature` to create new project or feature: write code, write tests, run tests, fix failures, confirm requirement is met",
        mode: "subagent",
        permission: {
            "*": "deny",
            "codesearch": "allow",
            "context7*": "allow",
            doom_loop: "ask",
            edit: "allow",
            external_directory: "ask",
            skill: {
                "*": "deny",
                "code*": "allow",
            },
            task: {
                "*": "deny",
                build_test: "allow",
                build_troubleshoot: "allow",
                os: "allow",
                query_code: "allow",
                query_git: "allow",
                query_text: "allow"
            },
            "todo*": "allow",
        },
        prompt: buildFeaturePrompt,
        temperature: 0.3,
        tier: "balanced",
    },

    build_format: {
        color: "#B03030",
        description: "Task `build_format` to format text files",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            edit: "allow",
            task: {
                "*": "deny",
                query_code: "allow",
                query_text: "allow",
            },
            "todo*": "allow",
        },
        prompt: buildFormatPrompt,
        temperature: 0.3,
        tier: "balanced",
    },

    build_general: {
        color: "#B0B030",
        description: "Task `build_general` only if no other subagents's description matches the requested task",
        mode: "subagent",
        permission: {
            "*": "allow",
            doom_loop: "ask",
            external_directory: "ask",
            task: {
                "*": "allow",
                ask: "deny",
                "build*": "deny",
                plan: "deny",
            },
        },
        prompt: buildGeneralPrompt,
        tier: "balanced",
    },

    build_git_commit: {
        color: "#B03030",
        description: "Task `build_git_commit` only if reviewing changes and creating professional git commits",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            "git_*": "allow",
            task: {
                "*": "deny",
                query_code: "allow",
                query_git: "allow",
                query_md: "allow",
                query_text: "allow"
            },
            "todo*": "allow",
        },
        prompt: buildGitCommitPrompt,
        temperature: 0.1,
        tier: "balanced",
    },

    build_optimize: {
        color: "#B03030",
        description: "Task `build_optimize` to improve existing code without changing behavior: optimize performance, readability, efficiency",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            edit: "allow",
            external_directory: "ask",
            skill: {
                "*": "deny",
                "code*": "allow",
            },
            task: {
                "*": "deny",
                os: "allow",
                query_code: "allow",
                query_git: "allow",
            },
            "todo*": "allow",
        },
        prompt: buildOptimizePrompt,
        temperature: 0.3,
        tier: "balanced",
    },

    build_review_api: {
        color: "#B03030",
        description: "Task `build_review_api` to review API changes: check endpoints, run tests, fix failures, and confirm API requirements are met",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            edit: "allow",
            task: {
                "*": "deny",
                os: "allow",
                query_code: "allow",
                query_git: "allow",
                query_text: "allow",
            },
            "todo*": "allow",
        },
        prompt: buildReviewApiPrompt,
        temperature: 0.3,
        tier: "balanced",
    },

    build_review_ui: {
        color: "#B03030",
        description: "Task `build_review_ui` to review UI changes: run application, inspect UI, run tests, fix failures, and confirm UI requirements are met",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            edit: "allow",
            task: {
                "*": "deny",
                os: "allow",
                query_browser: "allow",
                query_code: "allow",
                query_git: "allow",
                query_text: "allow",
            },
            "todo*": "allow",
        },
        prompt: buildReviewUiPrompt,
        temperature: 0.3,
        tier: "balanced",
    },

    build_test: {
        color: "#B03030",
        description: "Task `build_test` to increase unit test coverage: discover untested code, write tests, fix failures (tests only, not code)",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            edit: "allow",
            skill: {
                "*": "deny",
                "test*": "allow"
            },
            task: {
                "*": "deny",
                os: "allow",
                query_code: "allow",
                query_git: "allow",
            },
            "todo*": "allow",
        },
        prompt: buildTestPrompt,
        temperature: 0.3,
        tier: "balanced",
    },

    build_troubleshoot: {
        color: "#B03030",
        description: "Task `build_troubleshoot` to diagnose and fix problems: reproduce if needed, find root cause, apply fix, verify, repeat until resolved",
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            "context7*": "allow",
            doom_loop: "allow",
            edit: "allow",
            task: {
                "*": "deny",
                "os": "allow",
                "query*": "allow",
            },
            "todo*": "allow",
        },
        prompt: buildTroubleshootPrompt,
        temperature: 0.5,
        tier: "balanced",
    },

    document_conventions: {
        color: "#802020",
        description: "Task `document_conventions` to document naming conventions and project terminology",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
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
        color: "#FF4040",
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

    os: {
        color: "#802020",
        description: "Task `os` to execute scripts, bash commands, move/rename files/directories or administrate operating system; Not intended for read/write local codebase content, not intended for browser automation, not intended for any online tasks",
        mode: "subagent",
        permission: {
            "*": "deny",
            bash: "allow",
            doom_loop: "ask",
            edit: "allow",
            external_directory: "allow",
            "filesystem*": "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            "pty*": "allow",
            read: "allow",
            "todo*": "allow",
        },
        prompt: osPrompt,
        temperature: 0.1,
        tier: "balanced", // Not "fast", because it needs to make dangerous decisions
    },

    plan: {
        color: "#40FFFF",
        description: "Interactive Planning - Interview user, research problem, and create implementation plans",
        mode: "primary",
        permission: {
            "*": "deny",
            codesearch: "allow",
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

    query_browser: {
        color: "#208020",
        description: "Use this agent for frontend development & testing - Debug, test and verify YOUR RUNNING APPLICATION: inspect DOM elements, read console logs, analyze network requests, click UI elements, test performance and automate frontend testing. NOT for online research nor internet searches.",
        hidden: true,
        mode: "subagent",
        permission: {
            '*': "deny",
            "chrome*": "allow",
            "doom_loop": "ask",
            "todo*": "allow"
        },
        prompt: queryBrowserPrompt,
        tier: "fast",
    },

    query_code: {
        color: "#208020",
        description: "Task `query_code` to search, find, locate, summarize, report or understand: source code, scripts or codebase - NOT for reading entire files, instead use `read` tool to read entire file content",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            "context7*": "allow",
            doom_loop: "ask",
            external_directory: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            lsp: "allow",
            read: "allow",
            skill: {
                "*": "deny",
                "code*": "allow",
            },
        },
        prompt: queryCodePrompt,
        temperature: 0.3,
        tier: "balanced",
    },

    query_excel: {
        color: "#208020",
        description: "Task `query_excel` to handle Excel workbook manipulations or data retrievals",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            "excel_get*": "allow",
            "excel_read*": "allow",
            "excel_validate*": "allow",
            external_directory: "allow",
            glob: "allow",
            list: "allow",
        },
        prompt: queryExcelPrompt,
        temperature: 0.1,
        tier: "fast",
    },

    query_git: {
        color: "#208020",
        description: "Task `query_git` to manage Git repositories with staging, commits, and branching",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            external_directory: "allow",
            "git_git_diff*": "allow",
            git_git_log: "allow",
            git_git_show: "allow",
            git_git_status: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            read: "allow",
        },
        prompt: queryGitPrompt,
        temperature: 0.1,
        tier: "fast",
    },

    query_text: {
        color: "#208020",
        description: "Task `query_text` to search, find, locate, summarize, report or review: config file values, md sections, md front-matter, yaml files, json files, templates, assets, resources - NOT for reading entire files, instead use `read` tool to read entire file content",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            external_directory: "allow",
            glob: "allow",
            grep: "allow",
            list: "allow",
            lsp: "allow",
            read: "allow"
        },
        prompt: queryTextPrompt,
        temperature: 0.1,
        tier: "fast",
    },

    query_web: {
        color: "#208020",
        description: "Task `query_web` to search and read public online web sources: documentation, articles, forums, GitHub, news",
        hidden: true,
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            "todo*": "allow",
            "websearch*": "allow",
            webfetch: "allow",
        },
        prompt: queryWebPrompt,
        temperature: 0.7,
        tier: "fast",
    },

    explore: {
        disable: true,
    },

    general: {
        disable: true,
    },
}
export default agents
