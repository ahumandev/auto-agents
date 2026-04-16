---
name: plan_prd
description: Use this skill before planning any feature to understand the project's business requirements, user roles, and success criteria.
---

# Product Requirements

## Problem Statement
This repository ships an OpenCode plugin that injects a curated agent catalog, commands, and generated skills so work can be planned, delegated, executed, researched, reviewed, and documented inside OpenCode.

## Feature Requirements
- **Config injection**: `src/plugin.ts` merges bundled agents and commands into OpenCode config while preserving user overrides.
- **Managed skill generation**: `src/skills/index.ts` writes bundled `author_*` and `test_*` skills to `tmpdir()/autocode-opencode-skills` and prepends that path to `cfg.skills.paths`.
- **Interactive planning**: `plan` interviews with `question`, researches through delegated subagents, presents multiple solutions, gathers constraints, and must use `submit_plan` before exit.
- **Approved-plan execution**: `build` only proceeds from an approved plan, delegates phases to `build_*` subagents, and may route back to planning with `plan_enter` when needed.
- **Direct execution routing**: `execute` delegates non-planning work to code, OS, document, excel, review, troubleshooting, and query-oriented subagents.
- **Read-only research**: `ask` delegates only to `query_*` subagents and is configured as a read-only reporting workflow.
- **Documentation maintenance**: `execute_document` maintains memory docs through `document_*` specialists; its prompt requires `document_agents` to run last after `README.md` updates.
- **Backlog operations**: backlog work is handled by dedicated tools; `autocode_backlog_list` enumerates `!jobs/backlog` items and `autocode_backlog_read` reads an individual backlog item.
- **Ready job promotion**: `autocode_ready_job_create` accepts description, problem, solution, metric, and plan inputs and writes a refined job to `!jobs/ready/{job}/` with `goal.md` and `plan.md`.
- **Permission-scoped agents**: agent access is controlled through explicit permission maps; most agents start with `"*": "deny"`, while broader agents like `build_general` and `execute_os` are notable exceptions.

## User Roles
- **OpenCode user**: uses `ask`, `plan`, `build`, or `execute` for research or work delegation.
- **Analyst/planner**: `plan` interviews users, researches options, and submits plans for approval.
- **Project manager/executor**: `build` executes approved plans by delegating phases to `build_*` subagents.
- **Direct-action delegator**: `execute` routes immediate requests without entering planning mode.
- **Documentation maintainer**: `execute_document` and `document_*` agents keep memory docs aligned with repo facts.
- **Scoped specialist subagent**: each `build_*`, `query_*`, `execute_*`, or `document_*` agent operates within its permission block.

## Constraints & Assumptions
- This repository is a plugin/library, not a standalone app, server, or frontend UI.
- The plugin has no internal authentication layer; security is permission-centric and enforced through agent/tool authorization.
- User OpenCode config can override bundled agent definitions, permissions, and commands.
- Managed skills are generated at runtime into the OS temp directory and injected ahead of existing skill paths.
- Primary agents are orchestrators; most implementation, browsing, git, and OS actions are delegated to specialists.
- Browser work assumes manual user-managed authentication and read-only inspection of the running app.
- `execute_os` has broad shell/filesystem access, and `build_general` has broad fallback permissions.

## Success Metrics
- Approved implementation plans go through `submit_plan` before execution.
- Build/review workflows report concrete verification evidence instead of unsupported success claims.
- Generated skills are written with valid frontmatter and injected without dropping existing skill paths.
- Plugin config injection preserves existing user skill paths, URLs, and agent overrides.

## UX/UI Considerations
This project has no frontend surface in the repo. UX is prompt-, command-, and workflow-driven inside OpenCode through agent descriptions, question flows, delegated reports, and follow-up options.

## User Stories
- As an OpenCode user, I want bundled agents and commands loaded automatically so that I can use planning, execution, research, and documentation workflows in one place.
- As a planner, I want `plan` to interview me, research options, and submit a plan so that implementation starts from approved direction.
- As an operator, I want `build` to delegate each approved phase to the right specialist so that work stays scoped and reviewable.
- As a researcher, I want `ask` to stay read-only and use query specialists so that reports do not modify the workspace.
- As a documentation maintainer, I want `execute_document` and `document_*` specialists to update memory docs from repository evidence.

**IMPORTANT**: Update `.opencode/skills/plan/prd/SKILL.md` whenever product requirements, user roles, or business rules change.
