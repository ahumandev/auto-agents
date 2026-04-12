import type { OpencodeClient } from "@opencode-ai/sdk"
import { createTaskResumeTool } from "./task_resume"

export function createTools(client: OpencodeClient) {
    return {
        task_resume: createTaskResumeTool(client),
    }
}
