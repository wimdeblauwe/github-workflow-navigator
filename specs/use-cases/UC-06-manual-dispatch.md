# UC-06: Trigger a workflow manually

**Actor:** Developer
**Goal:** Re-run or dispatch a workflow without leaving the tool.

## Story

After finding the right workflow, the developer often wants to run it (e.g., trigger a release-snapshot). Currently this means clicking through to GitHub.

## Steps

1. Developer expands an app and finds the desired workflow.
2. Clicks "Run" (for `workflow_dispatch`-enabled workflows) or "Re-run last".
3. Optionally fills in inputs the workflow declares.
4. Sees the new run appear with running status.

## Notes

- Requires write permission via the auth model — not every user will have it.
- Not all workflows support `workflow_dispatch`. Disable the action with a tooltip when unavailable.
- Could be a v2 feature if it complicates the auth scope significantly.
