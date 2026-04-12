import { describe, test, expect } from "bun:test"
import type { Config, PluginInput } from "@opencode-ai/plugin"
import type { Session } from "@opencode-ai/sdk"
import { readFile } from "fs/promises"
import matter from "gray-matter"
import path from "path"
import autocode from "../plugin"
import type { OpencodeClient, SessionGetData } from "@opencode-ai/sdk"
import { ensureGeneratedSkills, injectGeneratedSkillsPath, managedSkills } from "./index"

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

function createClient(): OpencodeClient {
    return {
        session: {
            async get(args: SessionGetData) {
                const directory = args.query?.directory ?? "/workspace"

                return {
                    data: {
                        id: args.path.id,
                        projectID: "project-1",
                        directory,
                        title: "Session",
                        version: "1",
                        time: {
                            created: Date.now(),
                            updated: Date.now(),
                        },
                    } satisfies Session,
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
}

describe("managed skills", () => {
    test("writes frontmatter for all generated skills", async () => {
        const generatedRoot = await ensureGeneratedSkills()

        for (const skill of managedSkills) {
            const filePath = path.join(generatedRoot, ...skill.directory, "SKILL.md")
            const source = await readFile(filePath, "utf8")
            const parsed = matter(source)

            expect(parsed.data).toEqual({
                name: skill.name,
                description: skill.description,
            })
            expect(parsed.content.trim()).toBe(skill.content)
        }
    })

    test("prepends generated skill path without dropping existing entries", () => {
        const skillPaths = injectGeneratedSkillsPath(["/user/skills", "/workspace/skills"], "/generated/skills")

        expect(skillPaths).toEqual(["/generated/skills", "/user/skills", "/workspace/skills"])
    })

    test("avoids duplicate generated skill path injection", () => {
        const skillPaths = injectGeneratedSkillsPath(["/generated/skills", "/user/skills"], "/generated/skills")

        expect(skillPaths).toEqual(["/generated/skills", "/user/skills"])
    })
})

describe("plugin skill config injection", () => {
    test("adds generated skills path without dropping existing entries", async () => {
        const plugin = await autocode(createPluginInput(createClient()))
        const cfg = {
            agent: {},
            skills: { paths: ["/user/skills"], urls: ["https://example.com/skills"] },
        } as Config & { skills: { paths: string[], urls: string[] } }

        await plugin.config?.(cfg)

        const generatedRoot = await ensureGeneratedSkills()

        expect(cfg.skills.paths).toEqual([generatedRoot, "/user/skills"])
        expect(cfg.skills.urls).toEqual(["https://example.com/skills"])
    })

    test("does not duplicate generated skills path when config hook runs twice", async () => {
        const plugin = await autocode(createPluginInput(createClient()))
        const cfg = { agent: {}, skills: { paths: ["/user/skills"] } } as Config & { skills: { paths: string[] } }

        await plugin.config?.(cfg)
        await plugin.config?.(cfg)

        const generatedRoot = await ensureGeneratedSkills()

        expect(cfg.skills.paths).toEqual([generatedRoot, "/user/skills"])
    })
})
