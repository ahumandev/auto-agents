import { describe, expect, test } from "bun:test"
import type { Config, PluginInput, ToolContext } from "@opencode-ai/plugin"
import type { Session, OpencodeClient, SessionGetData, SessionChildrenData, SessionMessagesData, SessionPromptAsyncData } from "@opencode-ai/sdk"
import autocode from "../plugin"
import { createTaskResumeTool } from "./task_resume"

const PROMPT_TASK_RESUME = "You have been interrupted, therefore you MUST:\n1. Use `task_resume` tool to resume previous tasks\n2. Then resume your own work"
const PROMPT_WORK_RESUME = "Resume"

type ConfigWithRuntimeSections = Config & {
    agent: Record<string, { permission?: Record<string, unknown> }>
    command: Record<string, { agent?: string, template?: string }>
}

function createPluginInput(client: OpencodeClient): PluginInput {
    return {
        client,
        project: {
            id: "project-1",
            worktree: "/workspace",
            time: { created: Date.now() },
        },
        directory: "/workspace",
        worktree: "/workspace",
        serverUrl: new URL("http://localhost:4096"),
        $: {} as PluginInput["$"],
    }
}

function createToolContext(): ToolContext {
    return {
        sessionID: "session-1",
        messageID: "message-1",
        agent: "execute",
        directory: "/workspace",
        worktree: "/workspace",
        abort: new AbortController().signal,
        metadata() {
        },
        async ask() {
        },
    }
}

function createSession(id: string, directory: string, permission?: unknown): Session & { permission?: unknown } {
    return {
        id,
        projectID: "project-1",
        permission,
        directory,
        title: "Session",
        version: "1",
        time: {
            created: Date.now(),
            updated: Date.now(),
        },
    }
}

function createResumeMessages(permission?: unknown) {
    return [
        {
            info: {
                id: "user-1",
                role: "user",
                agent: "execute",
                permission,
                time: {
                    created: 1,
                },
            },
            parts: [],
        },
        {
            info: {
                id: "assistant-1",
                role: "assistant",
                providerID: "provider",
                modelID: "model",
                time: {
                    created: 2,
                },
            },
            parts: [{
                type: "tool",
                tool: "task",
                messageID: "assistant-1",
                state: {
                    status: "running",
                    time: {
                        start: 3,
                    },
                },
            }],
        },
    ] as Awaited<ReturnType<OpencodeClient["session"]["messages"]>>["data"]
}

function createChildrenForParent(parent: Session, child: Session) {
    return async function children(args: SessionChildrenData) {
        return { data: args.path.id === parent.id ? [child] : [] }
    }
}

describe("auto resume wiring", () => {
    test("registers task_resume tool with the injected client and resume command agent", async () => {
        const calls: Array<{ sessionID: string, directory: string }> = []
        const client: OpencodeClient = {
            session: {
                async get(args: SessionGetData) {
                    calls.push({ sessionID: args.path.id, directory: args.query?.directory ?? "" })
                    return {
                        data: createSession(args.path.id, args.query?.directory ?? ""),
                    }
                },
                async children() {
                    return { data: [] }
                },
                async messages() {
                    return { data: [] }
                },
                async promptAsync() {
                    return {}
                },
            },
        } as unknown as OpencodeClient
        const plugin = await autocode(createPluginInput(client))
        const cfg: ConfigWithRuntimeSections = { agent: {}, command: {} }

        await plugin.config?.(cfg)
        const result = await plugin.tool?.task_resume.execute({}, createToolContext())

        expect(plugin.tool?.task_resume).toBeDefined()
        expect(result).toBe("No interrupted descendants found.")
        expect(calls).toEqual([{ sessionID: "session-1", directory: "/workspace" }])
        expect(cfg.command.resume?.agent).toBe("execute")
        expect(cfg.command.resume?.template).toContain("task_resume")
        expect(cfg.agent.execute?.permission?.task_resume).toBe("allow")
    })

    test("uses resume prompt when task is allowed but task_resume is not", async () => {
        const prompts: string[] = []
        const parent = createSession("session-1", "/workspace")
        const child = createSession("session-2", "/workspace", {
            "*": "deny",
            task: {
                "*": "deny",
                execute_code: "allow",
            },
            task_resume: "allow",
        })
        const client: OpencodeClient = {
            session: {
                async get() {
                    return { data: parent }
                },
                children: createChildrenForParent(parent, child),
                async messages() {
                    return {
                        data: createResumeMessages({
                            "*": "deny",
                            task: {
                                "*": "deny",
                            },
                        }),
                    }
                },
                async promptAsync(args: SessionPromptAsyncData) {
                    const firstPart = args.body?.parts[0]
                    prompts.push(firstPart?.type === "text" ? firstPart.text : "")
                    return {}
                },
            },
        } as unknown as OpencodeClient

        await createTaskResumeTool(client).execute({}, createToolContext())

        expect(prompts).toEqual([PROMPT_WORK_RESUME])
    })

    test("uses task_resume prompt when task_resume is allowed", async () => {
        const prompts: string[] = []
        const parent = createSession("session-1", "/workspace")
        const child = createSession("session-2", "/workspace", {
            "*": "deny",
            task: {
                "*": "deny",
                "task_*": "allow",
            },
        })
        const client: OpencodeClient = {
            session: {
                async get() {
                    return { data: parent }
                },
                children: createChildrenForParent(parent, child),
                async messages() {
                    return {
                        data: createResumeMessages({
                            "*": "deny",
                            task: {
                                "*": "deny",
                            },
                        }),
                    }
                },
                async promptAsync(args: SessionPromptAsyncData) {
                    const firstPart = args.body?.parts[0]
                    prompts.push(firstPart?.type === "text" ? firstPart.text : "")
                    return {}
                },
            },
        } as unknown as OpencodeClient

        await createTaskResumeTool(client).execute({}, createToolContext())

        expect(prompts).toEqual([PROMPT_TASK_RESUME])
    })

    test("ignores message permission and uses session permission", async () => {
        const prompts: string[] = []
        const parent = createSession("session-1", "/workspace")
        const child = createSession("session-2", "/workspace", {
            "*": "deny",
            task: {
                "*": "deny",
                task_resume: "allow",
            },
        })
        const client: OpencodeClient = {
            session: {
                async get() {
                    return { data: parent }
                },
                children: createChildrenForParent(parent, child),
                async messages() {
                    return {
                        data: createResumeMessages({
                            "*": "deny",
                            task: {
                                "*": "deny",
                            },
                        }),
                    }
                },
                async promptAsync(args: SessionPromptAsyncData) {
                    const firstPart = args.body?.parts[0]
                    prompts.push(firstPart?.type === "text" ? firstPart.text : "")
                    return {}
                },
            },
        } as unknown as OpencodeClient

        await createTaskResumeTool(client).execute({}, createToolContext())

        expect(prompts).toEqual([PROMPT_TASK_RESUME])
    })
})
