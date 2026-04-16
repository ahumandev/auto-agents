const retryCounts = new Map<string, number>()

function sortValue(value: unknown, seen = new WeakSet<object>()): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => sortValue(item, seen))
    }

    if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
            return "[Circular]"
        }

        seen.add(value)

        return Object.keys(value)
            .sort((left, right) => left.localeCompare(right))
            .reduce<Record<string, unknown>>((result, key) => {
                const entry = (value as Record<string, unknown>)[key]
                result[key] = sortValue(entry, seen)
                return result
            }, {})
    }

    if (typeof value === "bigint" || typeof value === "function" || typeof value === "symbol") {
        return String(value)
    }

    return value
}

function flattenError(error: any): string {
    if (error instanceof Error) {
        if (error.name && error.name !== "Error" && error.message) {
            return `${error.name}: ${error.message}`
        }

        return error.message || error.name || "Unknown error"
    }

    if (typeof error === "string") {
        return error
    }

    if (error === null) {
        return "null"
    }

    if (error === undefined) {
        return "undefined"
    }

    if (typeof error === "object") {
        return JSON.stringify(sortValue(error))
    }

    return String(error)
}

export function createErrorResponse(failedAction: string, error: any, instruction: string): string {
    return JSON.stringify({
        failedAction,
        error: flattenError(error),
        instruction,
    })
}

export function createAbortResponse(failedAction: string, error: any): string {
    return createErrorResponse(failedAction, error, "Immediately ABORT your flow and wait for user instruction.")
}

export function createRetryResponse(failedAction: string, error: any, correctiveAction: string): string {
    const key = JSON.stringify([failedAction, correctiveAction])
    const retries = (retryCounts.get(key) ?? 0) + 1

    retryCounts.set(key, retries)

    if (retries > 5) {
        return createAbortResponse(failedAction, error)
    }

    return createErrorResponse(failedAction, error, correctiveAction)
}
