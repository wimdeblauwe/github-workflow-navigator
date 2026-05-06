# UC-05: Cross-cutting views ("show me all X")

**Actor:** Developer or release manager
**Goal:** Answer questions that span many apps at once, like "are all frontends green?" or "what's currently releasing?"

## Story

Because workflow types are standardized, certain questions become natural to ask across the whole monorepo: which tests are failing right now, which release-snapshots are running, which sub-components named "frontend" have problems.

## Steps

1. Developer chooses a cross-cutting filter (e.g., "type: test, status: failing").
2. The view pivots from app-grouped to a flat list of matching workflows across all apps.
3. Optionally combines with a path-segment filter (e.g., "all `*_frontend_*` tests that are failing").

## Notes

- This is the dashboard mode. Useful enough that it might justify a standalone web app rather than just a browser extension.
- Likely a v2 feature unless the team wants it from the start.
