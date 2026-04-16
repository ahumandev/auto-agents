Create src/utils/tools.ts which will be a helper utility for tools:
1. This tools.ts file will contain `createErrorResponse(failedAction, error, instruction)`:
   - Input parameters:
     - failedAction: What was attempted that failed (type string)
     - error: Actual error reported by third party tool/os/network etc. (type any)
     - instruction: Follow-up instruction to LLM how to handle this error (type string)
   - Output: Stringified version of
    ```ts
     {
        failedAction
        error,
        instruction
     }
    ```
   - `error` should be flattened to a plain string so that error message is readable
2. tools.ts file will contain `createAbortResponse(failedAction, error)`:
   - Shortcut for `createErrorResponse(failedAction, error, "Immediately ABORT your flow and wait for user instruction.")`
3. tools.ts file will contain `createRetryResponse(failedAction, error, correctiveAction)`:
    - This utility will have logic:
      - If retried > 5 times with same failedAction and correctiveAction call `createAbortResponse(failedAction, error)`
      - Else: call `createErrorResponse(failedAction, error, correctiveAction)`

# Refactor existing tools
- All existing tools should use this tools.ts utility to handle errors.
- Create a generic error handling instruction prompt in src/agents/prompts/error.ts
- Concatenate src/agents/prompts/error.ts to plan agent's prompt @src/agents/prompts/plan.ts so that it know how to handle errors from tools

# Documentation

Task execute_document to make AGENTS.md:
- aware of src/utils/tools.ts
- Favour reuse existing utilities over creating new utilities
- All tools should use same error handling mechanism described above
- Mention generic error handling prompt src/agents/prompts/error.ts