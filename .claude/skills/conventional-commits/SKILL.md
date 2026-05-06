---
name: conventional-commits
description: Create git commits using the Conventional Commits specification. Use this skill whenever the user wants to commit changes — "commit this", "make a commit", "commit my changes", "conventional commit", or just "commit". Analyzes staged/unstaged changes, determines the right type and scope, and creates the actual commit. Trigger even when the user doesn't explicitly mention "conventional commits".
---

# Conventional Commits

Create a git commit that follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Steps

### 1. Inspect the repo

Run these in parallel:
- `git status` — see what's staged vs unstaged
- `git diff --staged` — staged changes
- `git diff` — unstaged changes
- `git log --oneline -5` — recent commit style for reference

### 2. Handle staging

- If there are **staged changes**, use those.
- If nothing is staged but there are **unstaged changes**: stage everything with `git add` and proceed. If changes clearly span unrelated concerns, tell the user and ask what to include.
- If the working tree is **clean**, tell the user — nothing to commit.

### 3. Analyze and determine the message

Read the diff and pick:

**Type** — the primary intent of the change:

| Type       | When to use                                    |
|------------|------------------------------------------------|
| `feat`     | New feature or capability                      |
| `fix`      | Bug fix                                        |
| `docs`     | Documentation only (README, specs, comments)   |
| `style`    | Formatting, whitespace — no logic change       |
| `refactor` | Code restructure with no behavior change       |
| `test`     | Adding or modifying tests                      |
| `chore`    | Build tooling, dependencies, config, packaging |
| `build`    | Build system changes                           |
| `ci`       | CI/CD pipeline changes                         |
| `perf`     | Performance improvement                        |

**Scope** (optional) — a short noun in parentheses identifying the area changed. Derive from the main file, directory, or module affected (e.g., `parser`, `auth`, `panel`, `cache`). Omit if changes are broad or the scope is redundant with the type.

**Description** — imperative mood, lowercase, no trailing period. Keep the full subject line under 72 characters. Think: "this commit will `<description>`".

**Body** (optional) — only when the _why_ isn't obvious from the subject: hidden constraints, non-obvious tradeoffs, important context. Skip for straightforward changes.

### 4. Make the commit

Use a heredoc to avoid quoting issues. Always add the co-author trailer:

```bash
git commit -m "$(cat <<'EOF'
<type>[(<scope>)]: <description>

[optional body]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### 5. Report back

Show the commit hash and subject line so the user can confirm what was created.

Do NOT push. Pushing is a separate action the user will take explicitly.

## Examples

| Changes                                                         | Message                                                                       |
|-----------------------------------------------------------------|-------------------------------------------------------------------------------|
| Fix in `parser.js` where short suffix matched before longer one | `fix(parser): sort patterns by suffix length to guarantee longest-match wins` |
| Added OAuth flow across `auth.js`, `options.js`, `options.html` | `feat(auth): add OAuth and PKCE authentication alongside PAT`                 |
| Updated `README.md` with installation steps                     | `docs(readme): add installation instructions`                                 |
| Renamed variables across multiple files, no logic change        | `refactor: rename internal variables to match domain terminology`             |
| Added `package.sh` build script                                 | `chore: add packaging script`                                                 |
| Added `_ci-release-snapshot` rule to spec                       | `docs(conventions): clarify longest-match parsing rule`                       |
