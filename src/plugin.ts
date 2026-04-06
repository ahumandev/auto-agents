import { Plugin } from "@opencode-ai/plugin"
import type { Config } from "@opencode-ai/sdk/v2"
import agents from "./agents"
import { ensureGeneratedSkills, injectGeneratedSkillsPath } from "./skills"

/**
 * Autocode Plugin for OpenCode.
 *
 * Add to your opencode.jsonc:
 *   { "plugin": ["@autocode-ai/plugin"] }
 *
 * Or during local development via a file:// reference:
 *   { "plugin": ["file:///path/to/autocode/dist/plugin.js"] }
 */
const autocode: Plugin = async () => {
    return {
        async config(cfg: Config) {
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
        },
    }
}

export default autocode
