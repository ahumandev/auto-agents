import { mkdir, writeFile } from "fs/promises"
import { tmpdir } from "os"
import path from "path"
import { authorArticleSkill } from "./md/article";
import { authorRulesSkill } from "./md/rules";
import { authorTaskSkill } from "./md/task";
import { testJestSkill } from "./test/jest"
import { testJunitSkill } from "./test/junit"
import { testMockitoSkill } from "./test/mockito"
import { testVitestSkill } from "./test/vitest"

export type ManagedSkillDefinition = {
    name: string
    description: string
    directory: readonly string[]
    content: string
}

export const managedSkills: ManagedSkillDefinition[] = [
    authorArticleSkill,
    authorRulesSkill,
    authorTaskSkill,
    testJestSkill,
    testVitestSkill,
    testJunitSkill,
    testMockitoSkill,
].map((skill) => ({
    ...skill,
    content: skill.content.replaceAll("§", "`").trim(),
}))

const generatedSkillsRoot = path.join(tmpdir(), "autocode-opencode-skills")

function renderSkillMarkdown(skill: ManagedSkillDefinition): string {
    return `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n\n${skill.content}\n`
}

export async function ensureGeneratedSkills(): Promise<string> {
    await Promise.all(
        managedSkills.map(async (skill) => {
            const skillDir = path.join(generatedSkillsRoot, ...skill.directory)
            await mkdir(skillDir, { recursive: true })
            await writeFile(path.join(skillDir, "SKILL.md"), renderSkillMarkdown(skill), "utf8")
        }),
    )

    return generatedSkillsRoot
}

export function injectGeneratedSkillsPath(paths: string[] | undefined, generatedPath: string): string[] {
    return [generatedPath, ...(paths ?? []).filter((skillPath) => skillPath !== generatedPath)]
}
