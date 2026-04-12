import type { Plugin, PluginInput, Hooks } from "@opencode-ai/plugin"
import type { Config } from "@opencode-ai/sdk/v2"
import agents from "./agents"
import { commands } from "./commands"
import { ensureGeneratedSkills, injectGeneratedSkillsPath } from "./skills"
import { createTools } from "./tools"

async function mergeConfig(cfg: Config): Promise<void> {
    const generatedSkillsPath = await ensureGeneratedSkills()
    cfg.skills = cfg.skills ?? {}
    cfg.skills.paths = injectGeneratedSkillsPath(cfg.skills.paths, generatedSkillsPath)

    cfg.agent = cfg.agent ?? {}
    for (const [name, agentDef] of Object.entries(agents)) {
        cfg.agent[name] = {
            ...agentDef,
            ...cfg.agent[name],
        }
    }

    cfg.command = cfg.command ?? {}
    for (const [name, commandDef] of Object.entries(commands)) {
        cfg.command[name] = {
            ...commandDef,
            ...cfg.command[name],
        }
    }
}

const autocode: Plugin = async (input: PluginInput): Promise<Hooks> => {
    return {
        async config(cfg: Config) {
            await mergeConfig(cfg)
        },

        tool: createTools(input.client),
    }
}

export default autocode
