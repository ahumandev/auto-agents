---
name: plan_prd
description: Use this skill before planning any feature to understand the project's business requirements, user roles, and success criteria.
---

# Product Requirements

## Problem Statement
Autocode provides an OpenCode plugin that installs specialized agents and managed skills so users can plan work, delegate implementation, research the codebase, run reviews, and maintain project documentation inside the same workspace.

## Feature Requirements
- **Plugin registration**: `src/plugin.ts` merges the project's agent definitions into OpenCode config and prepends generated managed skills.
- **Interactive planning**: `plan` interviews users with `question`, researches via `query_*` subagents, uses `plan*` skills, and submits plans instead of implementing directly.
- **Approved-plan execution**: `build` consumes an approved plan, creates per-phase todos, delegates each phase to `build_*` supervisors, and reports outcomes plus suggested follow-ups.
- **Immediate execution**: `execute` routes non-planning requests to code, OS, document, research, review, or troubleshooting subagents.
- **Documentation orchestration**: `execute_document` delegates memory-doc maintenance to `document_*` specialists and always runs `document_readme` last.
- **Verification workflows**: `build_feature`, `build_test`, `build_review_api`, and `build_review_ui` require concrete verification and do not declare success without evidence.
- **Managed skills**: the plugin generates bundled authoring and test skills into a temp directory and injects that path ahead of existing skill paths.
- **Permission isolation**: each agent has an explicit deny-by-default or tightly scoped allowlist for tools, skills, and subagents.

## User Roles
- **OpenCode user**: asks for planning, execution, research, review, or documentation work.
- **Planner/analyst**: clarifies requirements and submits implementation plans for approval.
- **Operator/implementer**: runs approved plans or direct execution flows through delegated subagents.
- **Documentation maintainer**: keeps memory docs aligned through `document_*` agents.
- **Subagent**: performs only the tools, skills, and tasks allowed by its permission block.

## Constraints & Assumptions
- This package is an OpenCode plugin, not a standalone app or web UI.
- OpenCode provides authentication and tool permissions; repo code adds no separate auth layer.
- Primary agents delegate specialist work rather than editing, testing, browsing, or shelling directly.
- Complex requests should be redirected to `plan`; immediate requests should stay in `execute`.
- Documentation agents may read and edit docs, but `execute_document` itself must only delegate.
- UI/API review flows must start the target app, verify behavior, and clean up test data.

## Success Metrics
- Users can solve common planning and execution tasks without leaving OpenCode.
- Plans are approved before implementation starts.
- Implemented features and reviews include concrete verification evidence.
- Documentation updates stay aligned with actual code and agent permissions.
- Managed skills are available automatically after plugin configuration.

## UX/UI Considerations
This project is prompt- and command-driven inside OpenCode. UX relies on agent descriptions, structured question prompts, delegated subagent reports, and concise follow-up options rather than a standalone interface.

## User Stories
- As an OpenCode user, I want the plugin to register specialized agents so that I can route work to the right workflow quickly.
- As a planner, I want the plan agent to interview me and research context so that submitted plans are actionable.
- As an operator, I want build agents to delegate each phase to specialists so that implementation, testing, and troubleshooting stay scoped.
- As a reviewer, I want UI and API review flows to verify real behavior and clean up after themselves.
- As a documentation maintainer, I want document agents to update owned memory files so that future planning uses current project context.

**IMPORTANT**: Update this file whenever product requirements, user roles, or business rules change.
