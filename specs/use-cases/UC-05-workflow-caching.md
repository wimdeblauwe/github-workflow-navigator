# UC-05: Cache workflow data for faster loads

**Status:** Implemented (v0.2.0)
**Actor:** Developer
**Goal:** Avoid re-fetching workflow data on every page load while keeping a way to force a fresh fetch.

## Story

A developer visits the GitHub Actions page for the same repo multiple times in a day. Re-fetching hundreds of workflows on each visit is slow and burns GitHub API rate limit unnecessarily. Workflow definitions only change when the generator runs, so a stale-until-expired cache is an acceptable trade-off. When the developer *knows* something changed (or suspects stale data), they want a one-click way to bypass the cache.

## Steps

1. On page load the extension checks `chrome.storage.local` for a cached response for the current `owner/repo`.
2. If a valid cache entry exists (fetched within the last 24 hours), the cached data is used immediately — no API call is made.
3. If no entry exists, or the entry is older than 24 hours, the extension fetches from the GitHub API and stores the response in the cache before rendering.
4. The developer clicks the **↻ Refresh** button in the panel header to bypass the cache and force a fresh fetch.
5. After a forced fetch the cache is updated with the new data and the new timestamp.

## Notes

- Cache is keyed by `owner/repo` so a user working across multiple repos does not get cross-contamination.
- Cache TTL is 24 hours. This is sufficient because workflows only change when the generator runs, which is infrequent relative to daily browsing.
- No UI indicator for cache age is required in v0.2.0 — the refresh button is the escape hatch.
- Data is stored in `chrome.storage.local` under a single `workflowCache` key (a map of `owner/repo` → `{ fetchedAt, workflows }`).
