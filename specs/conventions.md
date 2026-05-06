# Workflow Naming Conventions

Workflows in our monorepos are auto-generated and follow a strict convention. The tool relies on this convention for parsing.

## Helper workflows

Any file starting with `_` (e.g., `_shared-build.yml`) is a helper used by other workflows. Not user-facing — hidden by default in the tool, with a "show helpers" toggle.

## Application workflows

Format:

    <app_path>_ci-<workflow_type>.yml

- `app_path` — one or more segments separated by `_`. E.g., `billing` (one level) or `billing_frontend` (two levels). Hierarchy depth is treated as n-level, not capped at 2.
- `workflow_type` — one of: `release`, `release-snapshot`, `test`, `sonar-qube`.

### Examples

| Filename                                       | App path              | Type                |
| ---------------------------------------------- | --------------------- | ------------------- |
| `billing_ci-test.yml`                          | `billing`             | `test`              |
| `billing_frontend_ci-release.yml`              | `billing/frontend`    | `release`           |
| `billing_frontend_ci-release-snapshot.yml`     | `billing/frontend`    | `release-snapshot`  |
| `billing_backend_ci-sonar-qube.yml`            | `billing/backend`     | `sonar-qube`        |

## Parsing rule

1. Strip the `.yml` extension.
2. If the filename starts with `_`, mark as helper. Done.
3. Otherwise, match `_ci-<type>` from the right, where `<type>` is one of the four known types. **Longest match wins** (so `release-snapshot` is matched before `release`).
4. The remainder is the app path. Split on `_` to get the hierarchy components.
5. If no suffix matches, mark the workflow as **unrecognized** — surface to the user as a likely generator bug rather than dropping silently.

## Open

- Confirm whether `_ci` is part of every workflow type or only some. Earlier description used suffixes like `-release` and `-test` without `_ci-`. If they coexist, the parser needs to accept both.
