# Open Questions

Decisions deferred until use cases stabilize.

## Form factor

Browser extension augmenting GitHub's UI, standalone web app, CLI, or VS Code extension? Leading candidate: browser extension as v1 (lowest friction, slots into existing GitHub Actions tab). Standalone web app may be needed for cross-cutting views (UC-05).

## Personal vs. team tool

Affects where favorites and any custom config live:

- **Personal:** browser local storage. Zero infrastructure.
- **Team:** backend service. Allows shared favorites and shared dashboards, but is meaningfully more software to build and operate.

## Authentication

- **Personal Access Token** — simple, fine for personal use.
- **GitHub App** — proper, scoped, auditable. Best for team use, especially with SSO.
- **OAuth** — per-user, lighter than a GitHub App but less flexible.

If the monorepos are in a GitHub Enterprise org with SSO, a GitHub App is probably the right answer.

## API budget and caching

100+ apps × 4 workflows × recent runs = significant API volume if naive. Decisions to make:

- Polling interval for run status.
- Cache duration for workflow definitions (rarely change — only when generator runs).
- REST vs. GraphQL (GraphQL likely better for batch status fetches).
- How to handle rate limits gracefully (degrade, don't fail).

## `_ci` prefix universality

Confirm whether `_ci-<type>` is the suffix for *every* workflow, or only for some types. Earlier discussion described suffixes like `-release` and `-test` without the `_ci-` prefix. Parser must accept whichever forms actually exist.

## Workflow dispatch inputs (if UC-06 in scope)

How to handle workflows with required inputs? Render a form generated from the workflow YAML's `inputs:` block? Fall back to GitHub's UI for those?
