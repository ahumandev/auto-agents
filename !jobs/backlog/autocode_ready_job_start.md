# Create autocode_session_create tool

Input parameters:
- job (Name of job that will be served with this session)
- Output format: JSON
  Output example:

```json
{"session_id": "abcdef1234"}
```

Utilize utils/tools.ts for error handling:
- bad/missing input parameter -> retry
- unexpected filesystem error -> abort

## Process

1. Convert `description` input parameter to `job` (descriptive name of job).
    - spaces or non-alphabetical characters should be renamed to _ (underscore)
    - duplicate __ (underscores) should be converted to single _ (underscore)
    - truncate names after 100 characters
    - Scan for existence of conflicting directory name in:
        - `!jobs/.archive/`
        - `!jobs/ready/`
        - `!jobs/feedback/`
        - `!jobs/started/`
        - `!jobs/tests/`
    - If conflict exist append timestamp in format "_YYYY-MM-DD-hh-mm-ss" to `job`
2. Create directory `!jobs/ready/{job}/`
3. Create files `!jobs/ready/{job}/plan.md` (exact copy of `plan` input parameter)
4. Create files `!jobs/ready/{job}/goal.md` (see below "Format of goal.md")
5. Respond with `job`

## Format of goal.md

```
# [description]

## Problem

[problem]

## Solution

[solution]

## Success Metric

[metric]
```

Replace `[identifier]` in above template with input parameter matching same identifier.

## Tests

Create test that mock file/directory create operations and ensure tool call these mocks correctly as expected.

## Document

Task `execute_document` to be aware of autocode_ready_... tools which handle ready jobs.
