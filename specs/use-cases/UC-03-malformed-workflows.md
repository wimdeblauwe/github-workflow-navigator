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
- The "Unrecognized" section (along with "Helpers") is collapsible and collapsed by default so it stays out of the way during normal navigation. The chevron toggle matches the one used by folders in the main tree. When a search query is active, the section auto-expands so matches are visible.
