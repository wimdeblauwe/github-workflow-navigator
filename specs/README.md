# Workflow Navigator — Specification

Working specs for a tool that makes large GitHub Actions workflow lists searchable and navigable in monorepos.

## Problem

In monorepos with hundreds of applications, GitHub's Actions UI lists every workflow in a paginated, unsearchable view. Finding "the test workflow for billing-api" requires endless clicking through "more". This tool replaces that with search and hierarchical browsing.

## Documents

- [`conventions.md`](./conventions.md) — workflow naming convention and parsing rules
- [`use-cases/`](./use-cases) — one file per user-facing use case
- [`open-questions.md`](./open-questions.md) — recorded decisions and remaining open questions

## Status

v0.1.0 shipped as a Chromium browser extension. UC-01, UC-02, UC-03 are implemented; UC-04 (favorites) is planned.
