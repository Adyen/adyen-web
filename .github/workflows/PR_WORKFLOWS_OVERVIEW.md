# Workflows Overview

## Consolidated PR Workflow

The main CI workflow for pull requests and merge queue is **`pr.yml`** (name: `PR`).

**Triggers**: `pull_request` (opened, synchronize, reopened), `merge_group`, `workflow_dispatch`

### Jobs in `pr.yml`

| Job | Timeout | Matrix | Description |
|-----|---------|--------|-------------|
| `unit-tests` | — | single job | Lint, type-check, test coverage |
| `e2e` | 120 min | 3 API versions (v69, v70, v71) x 3 browsers (chromium, firefox, webkit) = **9 jobs** | Playwright E2E tests. Uploads report artifacts. |
| `automated-a11y` | 60 min | API v71 x chromium = **1 job** | Playwright accessibility tests. Uploads a11y report artifact. |
| `automated-visual` | 60 min | API v71 x chromium = **1 job** | Playwright visual regression tests. Uploads visual report artifact. |

### Gateway Jobs

| Job | Runs on | Required jobs | Description |
|-----|---------|-------|-------------|
| `verify-pr` | always | `unit-tests`, `automated-a11y`, `automated-visual` | Passes only if unit-tests, a11y, and visual tests succeed. **E2E is optional on PR** (see rationale below). |
| `verify-merge-queue` | `merge_group` only | `unit-tests`, `e2e`, `automated-a11y`, `automated-visual` | Passes only if **all** jobs succeed. Enforces stricter requirements in the merge queue. |

**Rationale for E2E on PR**: Some E2E tests may be flaky. By making E2E optional on PR, the PR author can attempt to merge if they believe the tests will pass in the merge queue. The merge queue enforces that E2E must pass before merging to main.

### Branch protection configuration

Set these as **required status checks** in branch protection rules:
- `PR / verify-pr`
- `PR / verify-merge-queue`

**How it works**:
- On a **PR**: `verify-pr` runs and gates merging (unit-tests, a11y, visual must pass; e2e is informational). `verify-merge-queue` is skipped (not a `merge_group` event) so it doesn't block.
- On **merge queue**: both run. `verify-merge-queue` enforces that **all** jobs (including e2e) must pass before merging to main.
- E2E results still show ❌/✅ on the PR for visibility but don't block merging.

## Other PR-triggered Workflows (standalone)

| File | Workflow Name | Trigger | Jobs | Description |
|------|--------------|---------|------|-------------|
| `codeql-analysis.yml` | CodeQL | `pull_request` (branches: main), `push` (main), `merge_group`, `schedule` | `analyze` (2 jobs: JS + TS) | CodeQL static analysis. Kept separate due to push/schedule triggers. |
| `update-screenshots.yml` | Update Visual Test Screenshots | `pull_request` (types: labeled) | `update-screenshots` | Triggered only when `screenshot` label is added. Updates & commits screenshots. |
| `validate-remote-assets.yml` | Validate remote assets | `pull_request` (branches: main), `merge_group` | `check-secured-fields-assets` | Only runs on `changeset-release` branches. Validates SecuredFields assets are available live. |

## Non-PR Workflows

| File | Workflow Name | Triggers | Description |
|------|--------------|----------|-------------|
| `sonarcloud.yml` | SonarCloud | `push` (main) | Runs test coverage + SonarCloud scan on main branch. Split from the old `unit-tests.yml`. |
| `check-release-build.yml` | Check Commit Message | `push` (main) | Triggers release build if commit contains `[ci] release main`. |
| `npm-publish.yml` | Publish Package | `release` (created) | Publishes to npm. |
| `release-build.yml` | Build UMD and Translations | `workflow_dispatch`, `workflow_call` | Builds UMD bundle and uploads translations. |
| `release.yml` | Release | `push` (main) | Creates release PR via changesets. |
| `stale-issues-bot.yml` | Github Stale Issues Check | `schedule` (daily) | Closes stale issues. |

## Migration Summary

### Deleted files
- `unit-tests.yml` → split into `pr.yml` (unit-tests job) + `sonarcloud.yml` (push to main)
- `e2e.yml` → moved into `pr.yml` (e2e job)
- `automated-a11y.yml` → moved into `pr.yml` (automated-a11y job)
- `automated-visual.yml` → moved into `pr.yml` (automated-visual job)

### New files
- **`pr.yml`** — consolidated PR/merge-queue workflow
- **`sonarcloud.yml`** — lean push-to-main SonarCloud scan
