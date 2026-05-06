# Workflow Naming Conventions

Workflows in our monorepos are auto-generated and follow a strict convention. The tool relies on this convention for parsing.

## Helper workflows

Any file starting with `_` (e.g., `_shared-build.yml`) is a helper used by other workflows. Not user-facing — hidden by default in the tool, with a "show helpers" toggle.

## Application workflows

Two categories — `ci` (continuous integration) and `cd` (continuous delivery):

    <app_path>_ci-<workflow_type>.yml      (CI — enumerated types)
    <app_path>_cd[-<cd_variant>].yml       (CD — bare or open-ended variant)

- `app_path` — one or more segments separated by `_`. E.g., `billing` (one level) or `billing_frontend` (two levels). Hierarchy depth is treated as n-level, not capped at 2.
- CI `workflow_type` — one of: `release`, `release-snapshot`, `test`, `sonar-qube`.
- CD `cd_variant` is open-ended (e.g., `deploy-car`, `deploy-component`). Bare `_cd` (no variant) is also valid. All CD variants share a category and a badge color but keep their full type string for display.

### Examples

| Filename                                       | App path              | Category | Type                |
| ---------------------------------------------- | --------------------- | -------- | ------------------- |
| `billing_ci-test.yml`                          | `billing`             | `ci`     | `test`              |
| `billing_frontend_ci-release.yml`              | `billing/frontend`    | `ci`     | `release`           |
| `billing_frontend_ci-release-snapshot.yml`     | `billing/frontend`    | `ci`     | `release-snapshot`  |
| `billing_backend_ci-sonar-qube.yml`            | `billing/backend`     | `ci`     | `sonar-qube`        |
| `billing_frontend_cd.yml`                      | `billing/frontend`    | `cd`     | `cd`                |
| `billing_frontend_cd-deploy-car.yml`           | `billing/frontend`    | `cd`     | `cd-deploy-car`     |
| `billing_frontend_cd-deploy-component.yml`     | `billing/frontend`    | `cd`     | `cd-deploy-component` |

## Parsing rule

1. Strip the `.yml` extension.
2. If the filename starts with `_`, mark as helper. Done.
3. Otherwise, try CI suffixes (longest match wins so `_ci-release-snapshot` beats `_ci-release`):
   - `_ci-release-snapshot`
   - `_ci-sonar-qube`
   - `_ci-release`
   - `_ci-test`
4. If no CI suffix matches, try the CD pattern: `_cd` optionally followed by `-<variant>` where `<variant>` is any alphanumeric/hyphen sequence. The variant becomes part of the type identifier (e.g., `cd`, `cd-deploy-car`).
5. The remainder is the app path. Split on `_` to get the hierarchy components.
6. If neither pattern matches, mark the workflow as **unrecognized** — surface to the user as a likely generator bug rather than dropping silently.

## Display order

Within a leaf node, sort CI workflows first (in the order `release`, `release-snapshot`, `test`, `sonar-qube`), then CD workflows alphabetically by type (so bare `cd` comes before `cd-deploy-car`).

## Open

- Confirm whether `_ci` is part of every workflow type or only some. Earlier description used suffixes like `-release` and `-test` without `_ci-`. If they coexist, the parser needs to accept both.
