import { tool } from "@opencode-ai/plugin"
import { readFile, readdir } from "fs/promises"
import type { Dirent } from "fs"
import path from "path"
import { createAbortResponse } from "@/utils/tools"

type FileSystem = {
    readdir: (filePath: string, options: { withFileTypes: true }) => Promise<Dirent[]>
    readFile: (filePath: string, encoding: "utf8") => Promise<string>
}

const defaultFileSystem: FileSystem = {
    readdir,
    readFile,
}

function getDescription(source: string): string {
    const heading = source.match(/^#{1,6}\s+.*$/m)
    return heading?.[0]?.trim() ?? ""
}

export function createAutocodeBacklogListTool(fileSystem: FileSystem = defaultFileSystem) {
    return tool({
        description: "List available backlog items.",
        args: {},
        async execute(_, context) {
            const backlogDirectory = path.join(context.worktree, "!jobs", "backlog")

            try {
                const entries = await fileSystem.readdir(backlogDirectory, { withFileTypes: true })
                const backlog = await Promise.all(
                    entries
                        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
                        .sort((left, right) => left.name.localeCompare(right.name))
                        .map(async (entry) => {
                            const source = await fileSystem.readFile(path.join(backlogDirectory, entry.name), "utf8")

                            return {
                                label: entry.name.slice(0, -3),
                                description: getDescription(source),
                            }
                        })
                )

                return JSON.stringify({ backlog })
            }
            catch (error) {
                if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                    return JSON.stringify({ backlog: [] })
                }

                return createAbortResponse("list backlog items", error)
            }
        },
    })
}
