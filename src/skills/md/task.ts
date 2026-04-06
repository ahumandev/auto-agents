export const mdTaskSkill = {
    name: "md_task",
    description: "Apply `md_task` skill when writing agentic tasks.",
    directory: ["md", "task"],
    content: `    
- Instructions are provided in numerical points 
- Each point < 40 words
- If examples were provided, keep the examples as-is without making changes.
- If you generate new examples: create minimalistic examples
- Use emoji to highlight important aspects to LLM, like attention, warning, checklists, correct vs wrong
- Always keep md < 400 lines

Default md layout (unless different layout was requested):
\`\`\`
[Problem - Purpose why this task is necessary]

[Plan - Numbered TOC summarizing solution listing only high-level steps]

[Solution - Detailed practical action items per step (including code/config examples per step if needed) organized sequentially in sub-sections that link to Plan TOC]

[Verification - Instructions to validate if solution solve original problem, e.g. run unit test, check file content, measure system resources/time, etc.]

[Response Format - Layout, organization and constraints for each section of the response report (must address original problem)]

[Rules - Constraints and limitations of the LLM]
\`\`\`

- Include "Problem" section only if it was provided
- Include "Plan" section only if md file is > 100 lines
- Keep "Solution" section headers (step descriptions) < 7 words
- Include "Examples" in "Solution" section if available
- "Response format" section should guide the LLM what type or format of response is expected
- "Rules" section must guard limited LLM from critical mistakes, but allow to complete expected task

`.trim()
} as const
