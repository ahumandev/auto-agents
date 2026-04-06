import type { AgentConfig } from "@opencode-ai/sdk/v2"
import { askPrompt } from "./prompts/ask";
import { buildFeaturePrompt } from "./prompts/build/feature";
import { buildFormatPrompt } from "./prompts/build/format";
import { buildGeneralPrompt } from "./prompts/build/general";
import { buildGitCommitPrompt } from "./prompts/build/git_commit";
import { buildPrompt } from "./prompts/build"
import { buildRefactorPrompt } from "./prompts/build/refactor";
import { buildResearchPrompt } from "./prompts/build/research";
import { buildReviewApiPrompt } from "./prompts/build/review_api";
import { buildReviewUiPrompt } from "./prompts/build/review_ui";
import { buildTestPrompt} from "./prompts/build/test";
import { buildTroubleshootPrompt } from "./prompts/build/troubleshoot";
import { documentConventionsPrompt } from "./prompts/execute/document/conventions"
import { documentDesignPrompt } from "./prompts/execute/document/design"
import { documentInstallPrompt } from "./prompts/execute/document/install"
import { documentPrdPrompt } from "./prompts/execute/document/prd"
import { documentReadmePrompt } from "./prompts/execute/document/readme"
import { documentSecurityPrompt } from "./prompts/execute/document/security"
import { documentUxPrompt } from "./prompts/execute/document/ux"
import { executeAuthorPrompt } from "./prompts/execute/author";
import { executeCodePrompt } from "./prompts/execute/code";
import { executeDocumentPrompt } from "./prompts/execute/document"
import { executeExcelPrompt } from "./prompts/execute/excel";
import { executeOsPrompt } from "./prompts/execute/os";
import { executePrompt } from "./prompts/execute";
import { planPrompt } from "./prompts/plan"
import { queryBrowserPrompt } from "./prompts/query/browser";
import { queryCodePrompt } from "./prompts/query/code";
import { queryExcelPrompt } from "./prompts/query/excel";
import { queryGitPrompt } from "./prompts/query/git";
import { queryTextPrompt } from "./prompts/query/text";
import { queryWebPrompt } from "./prompts/query/web";

type ModelTier = "fast" | "balanced" | "smart"
type AgentConfigWithTier = AgentConfig & { tier?: ModelTier }
type AgentMap = Record<string, AgentConfigWithTier>

const agents: AgentMap = {
    ask: {
        color: "#FFFF40",
        description: "Generate research reports (read-only)",
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

    // build agents are smart agents that translate user problems to actionable processes or tasks (does no work itself)

    build: {
        color: "#4080FF",
        description: "Execute an existing approved plan by delegating its phases",
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
            },
            "todo*": "allow",
        },
        prompt: buildPrompt,
        temperature: 0.4,
        tier: "smart",
    },

    build_feature: {
        color: "#204080",
        description: "Task `build_feature` to create new project, features: Implement new API's, classes, components, css styles, packages, scripts, templates, webpages",
        mode: "subagent",
        permission: {
            "*": "deny",
            "codesearch": "allow",
            doom_loop: "ask",
            skill: {
                "*": "deny",
                "code*": "allow",
            },
            task: {
                "*": "deny",
                build_test: "allow",
                build_troubleshoot: "allow",
                execute_code: "allow",
                execute_os: "allow",
                query_code: "allow",
                query_git: "allow",
                query_text: "allow"
            },
            "todo*": "allow",
        },
        prompt: buildFeaturePrompt,
        temperature: 0.3,
        tier: "smart",
    },

    build_format: {
        color: "#204080",
        description: "Task `build_format` to format text files",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            edit: "allow",
            task: {
                "*": "deny",
                execute_code: "allow",
                execute_os: "allow",
                query_code: "allow",
                query_text: "allow",
            },
            "todo*": "allow",
        },
        prompt: buildFormatPrompt,
        temperature: 0.3,
        tier: "smart",
    },

    build_general: {
        color: "#204080",
        description: "Fallback to `build_general` when no specialized build agent clearly fits task",
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
            "todo*": "allow",
        },
        prompt: buildGeneralPrompt,
        tier: "smart",
    },

    build_git_commit: {
        color: "#204080",
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
                query_text: "allow"
            },
            "todo*": "allow",
        },
        prompt: buildGitCommitPrompt,
        temperature: 0.1,
        tier: "smart",
    },

    build_refactor: {
        color: "#204080",
        description: "Task `build_refactor` to upgrade, migrate or optimize code: improve security, performance, readability, efficiency, maintainability",
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "ask",
            skill: {
                "*": "deny",
                "code*": "allow",
            },
            task: {
                "*": "deny",
                execute_code: "allow",
                execute_os: "allow",
                query_code: "allow",
                query_git: "allow",
            },
            "todo*": "allow",
        },
        prompt: buildRefactorPrompt,
        temperature: 0.3,
        tier: "smart",
    },

    build_research: {
        color: "#204080",
        description: "Task `build_research` to query data, create research reports, find info user requested",
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "ask",
            task: {
                "*": "deny",
                "query*": "allow",
            },
            "todo*": "allow",
        },
        prompt: buildResearchPrompt,
        temperature: 0.5,
        tier: "balanced",
    },

    build_review_api: {
        color: "#204080",
        description: "Task `build_review_api` to review API changes: check endpoints, run tests, fix failures, and confirm API requirements are met",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            task: {
                "*": "deny",
                execute_code: "allow",
                execute_os: "allow",
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
        color: "#204080",
        description: "Task `build_review_ui` to review UI changes: run application, inspect UI, run tests, and confirm UI requirements are met",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            task: {
                "*": "deny",
                execute_code: "allow",
                execute_os: "allow",
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
        color: "#204080",
        description: "Task `build_test` to write or fix tests and, when explicitly needed, targeted code/config support for passing verification",
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
                execute_code: "allow",
                execute_os: "allow",
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
        color: "#204080",
        description: "Task `build_troubleshoot` to orchestrate diagnosis, delegated fixes, and verification until resolved",
        mode: "subagent",
        permission: {
            "*": "deny",
            codesearch: "allow",
            "context7*": "allow",
            doom_loop: "allow",
            task: {
                "*": "deny",
                execute_code: "allow",
                "execute_os": "allow",
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

    // executors execute a task immediately without planning (may delegate work to slaves)

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
            task: {
                "*": "allow",
                ask: "deny",
                "build*": "deny",
                plan: "deny",
            },
            "todo*": "allow"
        },
        prompt: executePrompt,
        tier: "smart",
    },

    execute_author: {
        color: "#802020",
        description: "Task `execute_author` to create or update documents, articles, agentic instructions or general Markdown; It NEVER edit source code or system config",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            edit: "allow",
            external_directory: "ask",
            glob: "allow",
            grep: "allow",
            list: "allow",
            read: "allow",
            skill: {
                "*": "deny",
                "md_*": "allow"
            },
            "todo*": "allow",
        },
        prompt: executeAuthorPrompt,
        temperature: 0.5,
        tier: "balanced",
    },

    execute_code: {
        color: "#802020",
        description: "Task `execute_code` to update the codebase with code, scripts, config, templates according to plain precise instructions; It NEVER write md files",
        mode: "subagent",
        permission: {
            "*": "deny",
            "codesearch": "allow",
            "context7*": "allow",
            doom_loop: "ask",
            edit: "allow",
            external_directory: "ask",
            glob: "allow",
            grep: "allow",
            list: "allow",
            lsp: "allow",
            read: "allow",
            skill: {
                "*": "deny",
                "code*": "allow",
            },
            "todo*": "allow"
        },
        prompt: executeCodePrompt,
        temperature: 0.1,
        tier: "balanced",
    },

    execute_document: {
        color: "#B03030",
        description: "Task `execute_document` to maintain agent/project memory docs for agents via document_* specialists",
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
        prompt: executeDocumentPrompt,
        temperature: 0.1,
        tier: "balanced",
    },

    execute_excel: {
        color: "#802020",
        description: "Task `execute_excel` to orchestrate excel workbook manipulations and data validation",
        mode: "subagent",
        permission: {
            "*": "deny",
            doom_loop: "ask",
            "excel_*": "allow",
            external_directory: "ask",
            task: {
                "*": "deny",
                query_excel: "allow",
                query_text: "allow"
            },
            "todo*": "allow",
        },
        prompt: executeExcelPrompt,
        temperature: 0.3,
        tier: "balanced",
    },

    execute_os: {
        color: "#802020",
        description: "Task `execute_os` to execute scripts, bash commands, move/rename files/directories or administrate operating system; not for source code editing, browser automation, or online research",
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
        prompt: executeOsPrompt,
        temperature: 0.1,
        tier: "balanced", // Not "fast", because it needs to make dangerous decisions
    },

    plan: {
        color: "#40FF40",
        description: "Interactive Planning - Interview user, research problem, and create implementation plans",
        mode: "primary",
        permission: {
            "*": "deny",
            codesearch: "allow",
            doom_loop: "ask",
            plan_exit: "allow",
            question: "allow",
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

    // query agents are slaves are only concerned about a specific domain to query

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
        description: "Task `query_git` for read-only git inspection: status, diff, log, show, and reporting",
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
