export const authorRulesSkill = {
    name: "author_rules",
    description: "Apply `author_rules` skill when writing agentic rules, constraints, instructions, like AGENTS.md",
    directory: ["author", "rules"],
    content: `
- Use logically organize bullet points in sections
- Each point < 20 words
- No repetitions
- If examples were provided, keep the examples as-is without making changes.
- If you generate new examples: create minimalistic examples
- Use emoji to highlight important aspects to LLM, like attention, warning, checklists, correct vs wrong
- Always keep md < 400 lines

Default md layout (unless different layout was requested):
\`\`\`
[TOC - only include if md is > 100 lines]

[Organized bullet point sections]
\`\`\`

`.trim()
} as const
