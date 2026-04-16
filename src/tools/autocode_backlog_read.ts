import { tool } from "@opencode-ai/plugin"
import { readFile } from "fs/promises"
import path from "path"
import { createAbortResponse, createErrorResponse } from "@/utils/tools"

type FileSystem = {
    readFile: (filePath: string, encoding: "utf8") => Promise<string>
}

const defaultFileSystem: FileSystem = {
    readFile,
}

export function createAutocodeBacklogReadTool(fileSystem: FileSystem = defaultFileSystem) {
    return tool({
        description: "Read backlog item plan content.",
        args: {
            label: tool.schema.string().describe("Label of backlog item to read."),
        },
        async execute(args, context) {
            const backlogFile = path.join(context.worktree, "!jobs", "backlog", `${args.label}.md`)

            try {
                return await fileSystem.readFile(backlogFile, "utf8")
            }
            catch (error) {
                if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                    return createErrorResponse("read backlog item", `Backlog item not found: ${args.label}`, "Ask the user to choose another backlog item or provide their requirement directly.")
                }

                return createAbortResponse("read backlog item", error)
            }
        },
    })
}
