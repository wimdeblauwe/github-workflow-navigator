# UC-03: See workflow status at a glance

**Actor:** Developer (especially during incident response)
**Goal:** Know which workflows are passing, failing, or running without clicking each one.

## Story

When something is broken, the developer wants to scan a list of apps and see at a glance which ones have failing CI. The default GitHub UI only shows status when you click into a workflow.

## Steps

1. Developer opens the tool.
2. Each app row shows 4 small status indicators — one per workflow type.
3. Status colors:
   - green: last run passed
   - red: last run failed
   - yellow: currently running
   - grey: never run / no recent data
4. Hovering an indicator shows last run time and commit.
5. Clicking opens the run in GitHub.

## Notes

- Parent rows in the hierarchy aggregate status from descendants. A parent shows red if any child is red.
- Status data should refresh automatically (polling or webhook) and visibly indicate when it was last refreshed.
- Worth a "failing first" sort mode for triage.
