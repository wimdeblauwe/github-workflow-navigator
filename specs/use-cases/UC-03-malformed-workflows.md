# UC-03: Surface malformed workflows

**Status:** Implemented (v0.1.0)
**Actor:** Platform team / generator maintainers
**Goal:** Know when a workflow doesn't match the expected naming convention.

## Story

The tool relies on the convention; when something doesn't match, it usually indicates a generator bug. Silently dropping unmatched workflows would hide real problems.

## Steps

1. Tool parses all workflows in the repo.
2. Anything that doesn't match a rule in `conventions.md` (helper, CI, or CD) is collected.
3. An "Unrecognized" section in the UI shows them with the actual filename.
4. Optional: link to file an issue or to the generator config.

## Notes

- Free linter for the workflow generator.
- Counts in the section header help track whether the situation is improving over time.
