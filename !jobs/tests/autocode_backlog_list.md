# Create a tool called `autocode_backlog_list`

Input parameters: None
Output format: JSON
Output example:

```json
{
  "backlog": [
    {
      "name": "autocode_backlog_list",
      "description": "# Create a tool called `autocode_backlog_list`", 
    },
    ...
  ]
}
```

(Note `.md` extension was dropped from name)

## Process

1. List all md files in `!plans/backlog`
2. Format JSON
3. Respond JSON

# Tests

Add test that mock directory listings and ensure tool respond with JSON in correct format.

# Document

Task `execute_document` to document that `!plans/backlog` contains unrefined user project requirements for potential future tasks.
