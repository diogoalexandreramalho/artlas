---
name: open-pr
description: Open a GitHub pull request for the current branch following the Artlas workflow. Use when the user wants to commit + push current work and open a PR. Handles branch creation off main, commit message conventions, and a standard PR title/body template.
---

# open-pr

Run the steps below **in order**. Stop and ask the user if a step is ambiguous — never guess at branch type, commit scope, or which files belong in the PR.

## 1. Pre-flight

Run in parallel:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git fetch origin main --quiet
git log --oneline origin/main..HEAD
gh pr view --json url,state
```

Decide based on the result:

- Working tree clean **and** branch already at `origin/main` (no commits ahead) → bail: nothing to PR.
- A PR already exists for this branch → skip to step 6 and just push, then surface the existing URL.
- Branch is `main` → must create a feature branch in step 3.
- Otherwise → proceed.

## 2. Determine type, scope, and slug

- **Type** ∈ { `feat`, `fix`, `chore`, `refactor`, `test`, `docs` }.
- **Scope** = the area of code touched, lowercase, one word. Examples in this repo: `auth`, `etl`, `api`, `db`, `frontend`, `tests`, `ci`, `deps`. Pick the narrowest accurate one. If a change spans many areas, omit the scope (commit becomes `<type>: ...`).
- **Slug** = 2–4 word kebab-case summary used for the branch name.

Infer all three from the diff and conversation. **If ambiguous, ask** — do not guess.

## 3. Branch

- On `main` → `git checkout -b <type>/<slug>`.
- On a feature branch → continue. Do not rename.

## 4. Stage + commit

- If `git diff --cached` is non-empty → commit only what's staged.
- Else if there are unstaged or untracked changes → show `git status` + `git diff --stat`, then ask which paths to include (or `all` / `none`). Untracked files require explicit confirmation (avoid `.env`-style leaks).
- Else if working tree clean but branch has unpushed commits → skip to step 5.

Message format: `<type>(<scope>): <imperative summary>` (≤ 70 chars total, lowercase, no trailing period). Scope is optional — omit the parentheses if the change spans many areas.

Examples:

- `feat(auth): add password reset flow`
- `fix(etl): handle empty wikidata response`
- `chore: bump pre-commit ruff version` (no scope — touches multiple areas)

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <imperative summary>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

If the pre-commit hook fails: fix the underlying issue (lint, test, typecheck) and create a **new** commit. Never `--no-verify`.

## 5. Push

- First push for this branch: `git push -u origin <branch>`.
- Otherwise: `git push`.

## 6. Open PR

Title: same as the commit `<type>(<scope>): <imperative>` (or composed from the leading commit if there are multiple).

```bash
gh pr create --title "<type>(<scope>): ..." --body "$(cat <<'EOF'
## Summary
- 1-3 bullets on what changed and the "why"

## Test plan
- [ ] commands run / UI flows verified

## Notes
- follow-ups, gaps, anything reviewer-relevant
EOF
)"
```

Omit any section that doesn't apply. If a PR already existed (step 1), skip `gh pr create` and surface the existing URL.

## 7. Return

Print the PR URL.

## Out of scope

- Merging the PR (the user does this).
- Deleting the branch.
- Drafts, reviewers, labels, milestones.
- Force-pushes (blocked on `main` by branch protection; on a feature branch, ask first).
