# Workflow Navigator — Specification

Working specs for a tool that makes large GitHub Actions workflow lists searchable and navigable in monorepos.

## Problem

In monorepos with hundreds of applications, GitHub's Actions UI lists every workflow in a paginated, unsearchable view. Finding "the test workflow for billing-api" requires endless clicking through "more". This tool replaces that with search, favorites, hierarchical browsing, and at-a-glance status.

## Documents

- [`conventions.md`](./conventions.md) — workflow naming convention and parsing rules
- [`use-cases/`](./use-cases) — one file per user-facing use case
- [`open-questions.md`](./open-questions.md) — design decisions still to be made

## Status

Draft. Iterating on use cases before committing to form factor and architecture.
