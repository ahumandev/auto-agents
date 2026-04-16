import type { OpencodeClient } from "@opencode-ai/sdk"
import { createAutocodeBacklogReadTool } from "./autocode_backlog_read"
import { createAutocodeBacklogListTool } from "./autocode_backlog_list"
import { createAutocodeReadyJobCreateTool } from "./autocode_ready_job_create"
import { createTaskResumeTool } from "./task_resume"

export function createTools(client: OpencodeClient) {
    return {
        autocode_backlog_read: createAutocodeBacklogReadTool(),
        autocode_backlog_list: createAutocodeBacklogListTool(),
        autocode_ready_job_create: createAutocodeReadyJobCreateTool(),
        task_resume: createTaskResumeTool(client),
    }
}
