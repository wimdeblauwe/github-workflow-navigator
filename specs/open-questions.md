# Decisions and Open Questions

## Decided

### Form factor — Chromium browser extension

A Manifest V3 extension that injects a panel into `github.com/*/*/actions` pages. Distributed as **unlisted** on the Chrome Web Store so colleagues install via a private link without the listing being publicly searchable. Auto-updates handled by Chrome.

Rejected alternatives: standalone web app (more infrastructure, no rationale once status/cross-cutting views are out of scope), CLI (wrong surface for "click to open in GitHub"), VS Code extension (smaller audience, harder to slot into the GitHub flow).

### Authentication — Personal Access Token (classic)

Each user pastes a classic PAT with `repo` scope into the extension's options page; stored in `chrome.storage.local`. SSO authorization on the token may be required depending on the GitHub org.

Rejected alternatives:
- **Fine-grained PAT:** needs per-org admin approval, which is friction for individual onboarding.
- **GitHub App:** the right answer for team-wide deployment but requires backend hosting and an admin install — overkill for v1's personal-tool model.
- **OAuth:** middle ground; defer until we have a backend.

A GitHub App remains the likely path if/when the tool grows to a shared service.

## Open

### Caching workflow definitions

Workflow definitions only change when the generator runs, so refetching on every page load is wasteful — but acceptable for v1 (one API call per repo visit, well within rate limits at this scale). Worth revisiting if users hit rate limits or notice latency.

### GitHub Enterprise Server support

The current implementation hard-codes `https://api.github.com` (GitHub Enterprise Cloud). If any target repos live on a self-hosted GitHub Enterprise Server instance, the API base URL needs to become configurable (e.g., per-host setting in options).
