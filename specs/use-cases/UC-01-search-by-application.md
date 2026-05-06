# UC-01: Search workflows by application

**Actor:** Developer
**Goal:** Quickly find the workflows belonging to a specific application.

## Story

Working in a monorepo with hundreds of apps, the developer needs to look at the test or release workflow for one app. The default GitHub UI requires endless "more" clicks. They want to type a few characters of the app name and see a focused list.

## Steps

1. Developer opens the tool.
2. Focuses the search box (keyboard shortcut: `/`).
3. Types part of the app name (e.g., `bill`).
4. Sees a filtered list of matching applications, each showing its 4 workflow slots with status indicators.
5. Clicks an app to expand and see the workflows; clicks a workflow to open it in GitHub.

## Notes

- Match should be fuzzy/substring against any path segment. Searching `frontend` matches `*_frontend_*` across all apps.
- Filter chips for workflow type (release / release-snapshot / test / sonar-qube) for narrowing further.
- Empty state when nothing matches should tell the user clearly (not just an empty list).
