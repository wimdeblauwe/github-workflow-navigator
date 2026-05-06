# UC-02: Favorite applications for quick access

**Actor:** Developer
**Goal:** Pin frequently-used applications to the top of the list.

## Story

Most developers regularly work on a small subset of the apps in the monorepo. They want a way to mark those as favorites so they don't have to search every time.

## Steps

1. Developer hovers an app row (or focuses it via keyboard).
2. Clicks the favorite icon (or presses `f`).
3. The app appears in a "Favorites" section pinned at the top of the list.
4. Favorites persist across sessions.

## Notes

- Favorites can be at any level of the hierarchy: a top-level app, or a specific sub-component (e.g., `billing/frontend` only).
- A favorited app that disappears (e.g., generator stopped producing it) should not crash the UI — show it as "missing" so the user can clean it up.
- Open question: are favorites personal (browser local storage) or team-shared (backend)? See `open-questions.md`.
