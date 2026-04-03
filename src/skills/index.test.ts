import { describe, test, expect } from "bun:test"
import { readFile } from "fs/promises"
import matter from "gray-matter"
import path from "path"
import autocode from "../plugin"
import { ensureGeneratedSkills, injectGeneratedSkillsPath, managedSkills } from "./index"

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
        const plugin = await autocode({ client: {} } as any)
        const cfg = {
            agent: {},
            skills: { paths: ["/user/skills"], urls: ["https://example.com/skills"] },
        } as any

        await plugin.config?.(cfg)

        const generatedRoot = await ensureGeneratedSkills()

        expect(cfg.skills.paths).toEqual([generatedRoot, "/user/skills"])
        expect(cfg.skills.urls).toEqual(["https://example.com/skills"])
    })

    test("does not duplicate generated skills path when config hook runs twice", async () => {
        const plugin = await autocode({ client: {} } as any)
        const cfg = { agent: {}, skills: { paths: ["/user/skills"] } } as any

        await plugin.config?.(cfg)
        await plugin.config?.(cfg)

        const generatedRoot = await ensureGeneratedSkills()

        expect(cfg.skills.paths).toEqual([generatedRoot, "/user/skills"])
    })
})
