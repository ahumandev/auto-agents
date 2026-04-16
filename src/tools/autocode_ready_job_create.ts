import { tool } from "@opencode-ai/plugin"
import { mkdir, writeFile, readdir } from "fs/promises"
import type { Dirent } from "fs"
import path from "path"
import { createAbortResponse, createRetryResponse } from "../utils/tools"

type FileSystem = {
    mkdir: (dirPath: string, options: { recursive: true }) => Promise<string | undefined>
    writeFile: (filePath: string, content: string) => Promise<void>
    readdir: (dirPath: string, options: { withFileTypes: true }) => Promise<Dirent[]>
}

const defaultFileSystem: FileSystem = {
    mkdir,
    writeFile,
    readdir,
}

function deriveSlug(description: string): string {
    return description
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 100)
}

function formatTimestamp(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
}

export function createAutocodeReadyJobCreateTool(fileSystem: FileSystem = defaultFileSystem) {
    return tool({
        description: "Create a new ready job with goal and plan.",
        args: {
            description: tool.schema.string().describe("Short description of the job."),
            problem: tool.schema.string().describe("Problem statement."),
            solution: tool.schema.string().describe("Proposed solution."),
            metric: tool.schema.string().describe("Success metric."),
            plan: tool.schema.string().describe("Detailed plan content."),
        },
        async execute(args, context) {
            if (!args.description || !args.problem || !args.solution || !args.metric || !args.plan) {
                return createRetryResponse(
                    "create ready job",
                    "Missing required arguments",
                    "Provide all required arguments: description, problem, solution, metric, plan."
                )
            }

            let job = deriveSlug(args.description)

            const scanDirs = [".archive", "ready", "feedback", "started", "tests"]
            let hasCollision = false

            for (const dir of scanDirs) {
                const dirPath = path.join(context.worktree, "!jobs", dir)
                try {
                    const entries = await fileSystem.readdir(dirPath, { withFileTypes: true })
                    if (entries.some((entry) => entry.name === job)) {
                        hasCollision = true
                        break
                    }
                }
                catch (error) {
                    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                        continue
                    }
                    return createAbortResponse("create ready job", error)
                }
            }

            if (hasCollision) {
                job = `${job}_${formatTimestamp(new Date())}`
            }

            const jobDir = path.join(context.worktree, "!jobs", "ready", job)

            try {
                await fileSystem.mkdir(jobDir, { recursive: true })
            }
            catch (error) {
                return createAbortResponse("create ready job", error)
            }

            try {
                await fileSystem.writeFile(path.join(jobDir, "plan.md"), args.plan)
                await fileSystem.writeFile(
                    path.join(jobDir, "goal.md"),
                    `# ${args.description}\n\n## Problem\n\n${args.problem}\n\n## Solution\n\n${args.solution}\n\n## Success Metric\n\n${args.metric}\n`
                )
            }
            catch (error) {
                return createAbortResponse("create ready job", error)
            }

            return JSON.stringify({ job })
        },
    })
}
