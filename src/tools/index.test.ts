import { describe, expect, mock, test } from "bun:test"
import type { Dirent } from "fs"
import type { Config, PluginInput, ToolContext } from "@opencode-ai/plugin"
import type { Session, OpencodeClient, SessionGetData, SessionChildrenData, SessionPromptAsyncData } from "@opencode-ai/sdk"
import autocode from "../plugin"
import { createAutocodeBacklogReadTool } from "./autocode_backlog_read"
import { createAutocodeBacklogListTool } from "./autocode_backlog_list"
import { createTaskResumeTool } from "./task_resume"
import { createAutocodeReadyJobCreateTool } from "./autocode_ready_job_create"
import { createAbortResponse, createErrorResponse } from "@/utils/tools"

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

function createMockClient(): OpencodeClient {
    return {
        session: {
            async get() {
                return { data: { id: "session-1", projectID: "project-1", directory: "/workspace", title: "Session", version: "1", time: { created: Date.now(), updated: Date.now() } } }
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
}

function createConfig(): ConfigWithRuntimeSections {
    return { agent: {}, command: {} }
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

describe("autocode_backlog_list tool", () => {
    test("registers the tool on the plugin and allows execute to use it", async () => {
        const plugin = await autocode(createPluginInput({
            session: {
                async get() {
                    return { data: createSession("session-1", "/workspace") }
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
        } as unknown as OpencodeClient))
        const cfg: ConfigWithRuntimeSections = { agent: {}, command: {} }

        await plugin.config?.(cfg)

        expect(plugin.tool?.autocode_backlog_list).toBeDefined()
        expect(cfg.agent.execute?.permission?.autocode_backlog_list).toBe("allow")
    })

    test("returns sorted backlog JSON with names and first heading descriptions", async () => {
        const reads: string[] = []
        const tool = createAutocodeBacklogListTool({
            async readdir() {
                return [
                    { name: "zeta.md", isFile: () => true },
                    { name: "notes.txt", isFile: () => true },
                    { name: "alpha.md", isFile: () => true },
                    { name: "nested", isFile: () => false },
                    { name: "plain.md", isFile: () => true },
                ] as Dirent[]
            },
            async readFile(filePath) {
                reads.push(String(filePath))

                if (String(filePath).endsWith("alpha.md")) {
                    return "Intro\n# Alpha Title\n## Second"
                }

                if (String(filePath).endsWith("zeta.md")) {
                    return "# Zeta Title\nMore"
                }

                return "Plain text only"
            },
        })

        const result = await tool.execute({}, createToolContext())

        expect(result).toBe(JSON.stringify({
            backlog: [
                { label: "alpha", description: "# Alpha Title" },
                { label: "plain", description: "" },
                { label: "zeta", description: "# Zeta Title" },
            ],
        }))
        expect(reads).toEqual([
            "/workspace/!jobs/backlog/alpha.md",
            "/workspace/!jobs/backlog/plain.md",
            "/workspace/!jobs/backlog/zeta.md",
        ])
    })
})

describe("autocode_backlog_read tool", () => {
    test("registers the tool on the plugin and allows execute to use it", async () => {
        const plugin = await autocode(createPluginInput({
            session: {
                async get() {
                    return { data: createSession("session-1", "/workspace") }
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
        } as unknown as OpencodeClient))
        const cfg: ConfigWithRuntimeSections = { agent: {}, command: {} }

        await plugin.config?.(cfg)

        expect(plugin.tool?.autocode_backlog_read).toBeDefined()
        expect(cfg.agent.execute?.permission?.autocode_backlog_read).toBe("allow")
    })

    test("returns raw backlog text and reads the expected file path", async () => {
        const reads: string[] = []
        const tool = createAutocodeBacklogReadTool({
            async readFile(filePath) {
                reads.push(String(filePath))
                return "# Item Title\n\nRaw body\n"
            },
        })

        const result = await tool.execute({ label: "example-item" }, createToolContext())

        expect(result).toBe("# Item Title\n\nRaw body\n")
        expect(reads).toEqual([
            "/workspace/!jobs/backlog/example-item.md",
        ])
    })

    test("returns a plain text message when the backlog file does not exist", async () => {
        const tool = createAutocodeBacklogReadTool({
            async readFile() {
                const error = new Error("Missing") as NodeJS.ErrnoException
                error.code = "ENOENT"
                throw error
            },
        })

        const result = await tool.execute({ label: "missing-item" }, createToolContext())

        expect(result).toBe(createErrorResponse("read backlog item", "Backlog item not found: missing-item", "Ask the user to choose another backlog item or provide their requirement directly."))
    })
})

describe("shared tool error handling", () => {
    test("returns abort response when task_resume cannot inspect the current session", async () => {
        const tool = createTaskResumeTool({
            session: {
                async get() {
                    return { error: { message: "Session lookup failed", code: "ESESSION" } }
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
        } as unknown as OpencodeClient)

        const result = await tool.execute({}, createToolContext())

        expect(result).toBe(createAbortResponse("inspect current session", { message: "Session lookup failed", code: "ESESSION" }))
    })
})

describe("autocode_ready_job_create tool", () => {
    test("registers tool and grants execute permission", async () => {
        const client = createMockClient()
        const plugin = await autocode(createPluginInput(client))
        const cfg = createConfig()
        await plugin.config?.(cfg)
        expect(plugin.tool?.autocode_ready_job_create).toBeDefined()
        expect(cfg.agent.execute?.permission?.autocode_ready_job_create).toBe("allow")
    })
})

describe("autocode_ready_job_create behaviour", () => {
    function createMockFs(readdirResult: { name: string }[][] = []) {
        let readdirCallCount = 0
        return {
            mkdir: mock(async (_path: string, _opts: { recursive: true }) => undefined as string | undefined),
            writeFile: mock(async (_path: string, _content: string) => {}),
            readdir: mock(async (_path: string, _opts: { withFileTypes: true }) => {
                const result = readdirResult[readdirCallCount] ?? []
                readdirCallCount++
                return result as any
            }),
        }
    }

    test("happy path: creates directories and writes files", async () => {
        const fs = createMockFs()
        const tool = createAutocodeReadyJobCreateTool(fs)
        const result = await tool.execute(
            { description: "My Feature", problem: "p", solution: "s", metric: "m", plan: "the plan" },
            createToolContext()
        )
        const parsed = JSON.parse(result)
        expect(parsed.job).toBe("My_Feature")
        expect(fs.mkdir).toHaveBeenCalledWith("/workspace/!jobs/ready/My_Feature", { recursive: true })
        expect(fs.writeFile).toHaveBeenCalledWith("/workspace/!jobs/ready/My_Feature/plan.md", "the plan")
        expect(fs.writeFile).toHaveBeenCalledWith(
            "/workspace/!jobs/ready/My_Feature/goal.md",
            "# My Feature\n\n## Problem\n\np\n\n## Solution\n\ns\n\n## Success Metric\n\nm\n"
        )
    })

    test("slug derivation: special chars, dedup underscores, truncate at 100", async () => {
        const fs = createMockFs()
        const tool = createAutocodeReadyJobCreateTool(fs)
        // Special chars become _, consecutive __ collapse
        const result = await tool.execute(
            { description: "Hello World! Test--Case", problem: "p", solution: "s", metric: "m", plan: "plan" },
            createToolContext()
        )
        const parsed = JSON.parse(result)
        expect(parsed.job).toBe("Hello_World_Test_Case")

        // Truncation at 100 chars
        const longDesc = "a".repeat(150)
        const result2 = await tool.execute(
            { description: longDesc, problem: "p", solution: "s", metric: "m", plan: "plan" },
            createToolContext()
        )
        const parsed2 = JSON.parse(result2)
        expect(parsed2.job.length).toBe(100)
    })

    test("collision: appends timestamp suffix when slug already exists", async () => {
        // readdir returns a matching entry on first call (ready dir)
        const fs = createMockFs([[{ name: "My_Feature" }]])
        const tool = createAutocodeReadyJobCreateTool(fs)
        const result = await tool.execute(
            { description: "My Feature", problem: "p", solution: "s", metric: "m", plan: "plan" },
            createToolContext()
        )
        const parsed = JSON.parse(result)
        expect(parsed.job).toMatch(/^My_Feature_\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/)
    })

    test("missing input: empty description returns retry response", async () => {
        const fs = createMockFs()
        const tool = createAutocodeReadyJobCreateTool(fs)
        const result = await tool.execute(
            { description: "", problem: "p", solution: "s", metric: "m", plan: "plan" },
            createToolContext()
        )
        const parsed = JSON.parse(result)
        expect(parsed.instruction).toContain("Provide all required arguments")
    })

    test("FS error on mkdir: returns abort response", async () => {
        const fsErr = {
            mkdir: mock(async () => { throw new Error("disk full") }),
            writeFile: mock(async () => {}),
            readdir: mock(async (_path: string, _opts: any) => [] as any),
        }
        const tool = createAutocodeReadyJobCreateTool(fsErr)
        const result = await tool.execute(
            { description: "My Feature", problem: "p", solution: "s", metric: "m", plan: "plan" },
            createToolContext()
        )
        const parsed = JSON.parse(result)
        expect(parsed.instruction).toContain("ABORT")
    })
})
