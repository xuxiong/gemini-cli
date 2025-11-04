<!-- 
Sync Impact Report:
- Version change: 1.0.0 → 1.0.1
- Added sections: Principle 6 - AI Output Language Requirement
- Templates requiring updates: plan-template.md, spec-template.md, tasks-template.md (✅ updated)
- Modified principles: Added PRINCIPLE_6_AI_OUTPUT_CHINESE
-->

# @google/gemini-cli Constitution

## Core Principles

### I. Library-First Architecture

Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries

### II. CLI Interface

Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats

### III. Test-First (NON-NEGOTIABLE)

TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced

### IV. Integration Testing

Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas

### V. Observability

Text I/O ensures debuggability; Structured logging required; Performance metrics collection and monitoring required for production systems

### VI. AI Output Language Requirement

All AI-generated content must be in Chinese language when requested by the user; Implementation must support language preference detection and response localization; All user-facing AI outputs must adhere to this requirement

## Additional Constraints

Technology stack requirements: Node.js v20+, TypeScript, React for UI components; Compliance with Google's AI principles and responsible AI practices; Deployment policies follow Google's security standards

## Development Workflow

Code review requirements: All PRs must be reviewed by at least one senior developer; Testing gates require 80% test coverage; All changes must pass pre-commit hooks before merging

## Governance

This Constitution supersedes all other development practices; Amendments require documentation, team approval, and migration plan if necessary; All PRs/reviews must verify compliance with these principles

**Version**: 1.0.1 | **Ratified**: 2025-06-13 | **Last Amended**: 2025-11-04
