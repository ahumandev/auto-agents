import { tool } from "@opencode-ai/plugin"
import type { AssistantMessage, Message, OpencodeClient, Part, Session, UserMessage, SessionPromptAsyncData } from "@opencode-ai/sdk"
import type { PermissionConfig } from "@opencode-ai/sdk/v2"
import { createAbortResponse, createRetryResponse } from "@/utils/tools"

const PROMPT_TASK_RESUME = "You have been interrupted, therefore you MUST:\n1. Use `task_resume` tool to resume previous tasks\n2. Then resume your own work"
const PROMPT_WORK_RESUME = "Resume"

type SessionMessage = {
    info: Message
    parts: Part[]
}

type PromptAsyncBody = NonNullable<SessionPromptAsyncData["body"]>

type ResumeContext = {
    agent?: PromptAsyncBody["agent"]
    model?: PromptAsyncBody["model"]
    system?: PromptAsyncBody["system"]
    permission?: PermissionConfig
}

type SessionWithPermission = Session & {
    permission?: unknown
}

type Candidate = {
    session: Session
    timestamp: number
    context: ResumeContext
}

type ResumeState = {
    resumed: Set<string>
    visited: Set<string>
    errors: string[]

}

export type { OpencodeClient }


const INTERRUPTED_ERROR_NAMES = new Set(["MessageAbortedError"])

function isUserMessage(message: Message): message is UserMessage {
    return message.role === "user"
}

function isAssistantMessage(message: Message): message is AssistantMessage {
    return message.role === "assistant"
}

function isToolPart(part: Part): part is Extract<Part, { type: "tool" }> {
    return part.type === "tool"
}

function getPartTimestamp(part: Part): number | undefined {
    switch (part.type) {
        case "tool":
            if (part.state.status === "running") {
                return part.state.time.start
            }
            if (part.state.status === "completed" || part.state.status === "error") {
                return part.state.time.end
            }
            return undefined
        case "text":
        case "reasoning":
            return part.time?.end ?? part.time?.start
        case "retry":
            return part.time.created
        default:
            return undefined
    }
}

function getCandidateTimestamp(assistant: AssistantMessage, parts: Part[]): number {
    let timestamp = assistant.time.completed ?? assistant.time.created

    for (const part of parts) {
        const partTimestamp = getPartTimestamp(part)
        if (partTimestamp && partTimestamp > timestamp) {
            timestamp = partTimestamp
        }
    }

    return timestamp
}

function hasInterruptedError(assistant: AssistantMessage): boolean {
    if (!assistant.error) {
        return false
    }

    if (INTERRUPTED_ERROR_NAMES.has(assistant.error.name)) {
        return true
    }

    const message = assistant.error.data?.message
    if (typeof message !== "string") {
        return false
    }

    return /abort|aborted|interrupt|interrupted|cancelled|canceled/i.test(message)
}

function isPermissionRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getSessionPermission(session: Session): PermissionConfig | undefined {
    if (!isPermissionRecord(session)) {
        return undefined
    }

    const permission = (session as SessionWithPermission).permission
    return isPermissionRecord(permission) ? permission as PermissionConfig : undefined
}

function matchesPermissionPattern(value: string, pattern: string): boolean {
    if (pattern === "*") {
        return true
    }

    const escapedPattern = pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*")
    return new RegExp(`^${escapedPattern}$`).test(value)
}

function getAllowedPermissionValue(permission: PermissionConfig | undefined, name: string): string | undefined {
    if (!isPermissionRecord(permission)) {
        return undefined
    }

    const exact = permission[name]
    if (typeof exact === "string") {
        return exact
    }

    let matchedValue: string | undefined
    let matchedSpecificity = -1

    for (const [pattern, value] of Object.entries(permission)) {
        if (typeof value !== "string" || !pattern.includes("*") || !matchesPermissionPattern(name, pattern)) {
            continue
        }

        const specificity = pattern.replace(/\*/g, "").length
        if (specificity > matchedSpecificity) {
            matchedValue = value
            matchedSpecificity = specificity
        }
    }

    return matchedValue
}

function hasBuiltInTaskPermission(permission: PermissionConfig | undefined): boolean {
    if (!isPermissionRecord(permission)) {
        return false
    }

    const taskPermission = permission.task
    if (isPermissionRecord(taskPermission)) {
        return true
    } else {
        return getAllowedPermissionValue(permission, "task") === "allow"
    }
}

function hasDelegatedTaskPermission(permission: PermissionConfig | undefined, toolName: string): boolean {
    if (!isPermissionRecord(permission) || !isPermissionRecord(permission.task)) {
        return false
    }

    return getAllowedPermissionValue(permission.task as PermissionConfig, toolName) === "allow"
}

function getResumePrompt(context: ResumeContext): string {
    return hasBuiltInTaskPermission(context.permission) && hasDelegatedTaskPermission(context.permission, "task_resume") ? PROMPT_TASK_RESUME : PROMPT_WORK_RESUME
}

function getResumeContext(messages: SessionMessage[], assistant: AssistantMessage, session: Session): ResumeContext {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index]?.info
        if (!message || !isUserMessage(message)) {
            continue
        }

        return {
            agent: message.agent,
            model: message.model,
            system: message.system,
            permission: getSessionPermission(session),
        }
    }

    return {
        permission: getSessionPermission(session),
        model: {
            providerID: assistant.providerID,
            modelID: assistant.modelID,
        },
    }
}

function getLatestAssistant(messages: SessionMessage[]): SessionMessage | undefined {
    return [...messages]
        .filter((message) => isAssistantMessage(message.info))
        .sort((left, right) => left.info.time.created - right.info.time.created)
        .at(-1)
}

function isResumableAssistantStep(assistant: AssistantMessage, parts: Part[]): boolean {
    if (assistant.time.completed === undefined) {
        return true
    }

    if (parts.some((part) => part.type === "tool" && (part.state.status === "pending" || part.state.status === "running"))) {
        return true
    }

    return hasInterruptedError(assistant)
}

function getCandidate(messages: SessionMessage[], session: Session): Candidate | undefined {
    const latestAssistantMessage = getLatestAssistant(messages)
    if (!latestAssistantMessage || !isAssistantMessage(latestAssistantMessage.info)) {
        return undefined
    }

    const assistant = latestAssistantMessage.info
    const assistantParts = latestAssistantMessage.parts
        .filter((part) => part.messageID === assistant.id)
        .sort((left, right) => (getPartTimestamp(left) ?? 0) - (getPartTimestamp(right) ?? 0))

    if (!isResumableAssistantStep(assistant, assistantParts)) {
        return undefined
    }

    const lastToolPart = [...assistantParts]
        .reverse()
        .find(isToolPart)

    if (!lastToolPart || lastToolPart.tool !== "task") {
        return undefined
    }

    return {
        session,
        timestamp: getCandidateTimestamp(assistant, assistantParts),
        context: getResumeContext(messages, assistant, session),
    }
}

function getGroupedCandidates(candidates: Candidate[]): Candidate[] {
    const sorted = [...candidates].sort((left, right) => right.timestamp - left.timestamp)
    const seed = sorted[0]

    if (!seed) {
        return []
    }

    // Only consider candidates within 3 seconds of last candidate (to resume entire group of concurrent tasks)
    return sorted
        .filter((candidate) => Math.abs(seed.timestamp - candidate.timestamp) <= 3000)
        .sort((left, right) => left.timestamp - right.timestamp)
}

async function loadSessionMessages(client: OpencodeClient, session: Session): Promise<SessionMessage[]> {
    const response = await client.session.messages({
        path: { id: session.id },
        query: {
            directory: session.directory,
            limit: 30, // Only scan last 30 messages for current tasks
        }
    })

    if (response.error || !response.data) {
        throw new Error(`Unable to inspect messages for ${session.id}`)
    }

    return response.data
}

async function findGroupedCandidates(client: OpencodeClient, session: Session): Promise<Candidate[]> {
    const childrenResponse = await client.session.children({
        path: { id: session.id },
        query: {
            directory: session.directory,
        }
    })

    if (childrenResponse.error || !childrenResponse.data) {
        throw new Error(`Unable to inspect child sessions for ${session.id}`)
    }

    const candidates: Candidate[] = []

    for (const child of childrenResponse.data) {
        const messages = await loadSessionMessages(client, child)
        const candidate = getCandidate(messages, child)
        if (candidate) {
            candidates.push(candidate)
        }
    }

    return getGroupedCandidates(candidates)
}

async function resumeSession(client: OpencodeClient, candidate: Candidate): Promise<boolean> {
    const response = await client.session.promptAsync({
        path: { id: candidate.session.id },
        query: {
            directory: candidate.session.directory,
        },
        body: {
            agent: candidate.context.agent,
            model: candidate.context.model,
            system: candidate.context.system,
            parts: [{
                type: "text",
                text: getResumePrompt(candidate.context),
            }],
        }
    })

    return !response.error
}

async function resumeInterruptedDescendants(client: OpencodeClient, session: Session, state: ResumeState): Promise<void> {
    if (state.visited.has(session.id)) {
        return
    }

    state.visited.add(session.id)

    let candidates: Candidate[] = []

    try {
        candidates = await findGroupedCandidates(client, session)
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        state.errors.push(message)
        return
    }

    for (const candidate of candidates) {
        if (state.visited.has(candidate.session.id)) {
            continue
        }

        await resumeInterruptedDescendants(client, candidate.session, state)

        try {
            const resumedNow = await resumeSession(client, candidate)
            if (resumedNow) {
                state.resumed.add(candidate.session.id)
            }
            else {
                state.errors.push(`Unable to resume ${candidate.session.id} `)
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            state.errors.push(`Unable to resume ${candidate.session.id}: ${message} `)
        }
    }
}

export function createTaskResumeTool(client: OpencodeClient) {
    return tool({
        description: "Use `task_resume` tool to resume previous `task` sessions when your session was interrupted.",
        args: {},
        async execute(_, context) {

            try {
                const sessionResponse = await client.session.get({
                    path: { id: context.sessionID },
                    query: {
                        directory: context.directory,
                    }
                })

                if (sessionResponse.error || !sessionResponse.data) {
                    return createAbortResponse("inspect current session", sessionResponse.error ?? `Current session unavailable: ${context.sessionID}`)
                }

                const state: ResumeState = {
                    resumed: new Set<string>(),
                    visited: new Set<string>(),
                    errors: [],
                }

                await resumeInterruptedDescendants(client, sessionResponse.data, state)

                if (state.resumed.size === 0) {
                    if (state.errors.length > 0) {
                        return createRetryResponse("resume interrupted descendants", state.errors[0], "Retry `task_resume` once. If the same failure continues, stop and ask the user how to proceed.")
                    }

                    return "No interrupted descendants found."
                }

                const summary = `Resumed ${state.resumed.size} session${state.resumed.size === 1 ? "" : "s"}: ${[...state.resumed].join(", ")}.`
                if (state.errors.length === 0) {
                    return `${summary} You can now resume your own work.`
                }

                return `${summary} ${createRetryResponse("resume interrupted descendants", state.errors[0], "Retry `task_resume` only if more interrupted descendant work is still expected.")}`
            }
            catch (error) {
                return createAbortResponse("resume interrupted descendants", error)
            }
        },
    })
}
