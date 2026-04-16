# Create a tool called `autocode_backlog_read`

Input parameters:
    - name (Backlog item name to read)
Output format: TEXT
Output example:

```text
Raw text of backlog plan...
```

(Note `.md` extension was dropped from name)

## Process

1. Read `!plans/backlog/{name}.md` (Note prefix and added `.md` file extension)
2. Respond with entire file content

# Tests

Create test that mock file read operation and ensure tool respond with expected text.

# Document

Task `execute_document` to be aware of autocode_backlog_... tools which does backlog operations.
