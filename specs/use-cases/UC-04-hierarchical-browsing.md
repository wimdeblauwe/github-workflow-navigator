# UC-04: Browse the application hierarchy

**Actor:** Developer
**Goal:** Navigate a multi-level app tree (e.g., `billing/frontend`, `billing/backend`) without losing context.

## Story

Some apps have sub-components (frontend, backend, etc.). The developer wants to see them grouped under their parent app and drill in as needed.

## Steps

1. Top-level apps are shown by default.
2. Apps with children show a disclosure indicator.
3. Clicking expands to show child components, each of which expands to show its 4 workflows.
4. Expansion state persists per session (or longer).

## Notes

- Tree should be n-level, not capped at 2.
- Edge case: an app could conceivably have *both* direct workflows and sub-components. Decide whether the generator allows this; if yes, render mixed nodes.
- Keyboard navigation: arrow keys to move, enter/space to expand.
