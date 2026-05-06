# UC-07: Surface malformed workflows

**Actor:** Platform team / generator maintainers
**Goal:** Know when a workflow doesn't match the expected naming convention.

## Story

The tool relies on the convention; when something doesn't match, it usually indicates a generator bug. Silently dropping unmatched workflows would hide real problems.

## Steps

1. Tool parses all workflows in the repo.
2. Anything that doesn't match the helper rule or the `<path>_ci-<type>.yml` rule is collected.
3. An "Unmatched" section in the UI (collapsed by default) shows them with the actual filename.
4. Optional: link to file an issue or to the generator config.

## Notes

- Free linter for the workflow generator.
- Counts in the section header help track whether the situation is improving over time.
