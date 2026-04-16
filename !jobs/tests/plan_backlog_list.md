# Update the @src/agents/prompts/plan.ts plan agent

- If user requirement is unclear -> interview (current behaviour is correct)
- If user requirement is clear -> proceed (current behaviour is correct)
- If user requirement is completely missing or user ask to list "backlog" follow BACKLOG IMPLEMENTATION (new feature)

## BACKLOG IMPLEMENTATION
- Use `autocode_backlog_list` tool to display items using question
- See `autocode_backlog_list` tool source for output format
- Instruct agent how to format output using `question` tool
- If user answer with backlog item, use `autocode_backlog_read` tool to read plan into context and proceed with that plan as new user requirement.

## Permissions

Add `autocode_backlog*` tool permissions to plan agent.