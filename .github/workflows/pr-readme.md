# Workflows Overview

## Consolidated PR Workflow

The main CI workflow for pull requests and merge queue is **`pr.yml`** (name: `PR`).

**Triggers**: `pull_request` (opened, synchronize, reopened), `merge_group`, `workflow_dispatch`

### Architecture

`pr.yml` is a **thin orchestrator** that calls reusable workflows. This keeps the main workflow file clean and easy to review.

### Reusable Workflows

| File | Job name | Timeout | Matrix | Description |
|------|----------|---------|--------|-------------|
| `unit-tests.yml` | `unit-tests` | — | single job | Lint, type-check, test coverage |
| `e2e-tests.yml` | `e2e-tests` | 120 min | 3 API versions (v69, v70, v71) x 3 browsers (chromium, firefox, webkit) = **9 jobs** | Playwright E2E tests. Uploads report artifacts. |
| `automated-a11y.yml` | `automated-a11y` | 60 min | API v71 x chromium = **1 job** | Playwright accessibility tests. Uploads a11y report artifact. |
| `visual-tests.yml` | `visual-tests` | 60 min | API v71 x chromium = **1 job** | Playwright visual regression tests. Uploads visual report artifact. |

### Gateway Jobs

| Job | Runs on | Required jobs | Description |
|-----|---------|-------|-------------|
| `verify-pr` | always | `unit-tests`, `automated-a11y`, `visual-tests` | Passes only if unit-tests, a11y, and visual tests succeed. **E2E is optional on PR** (see rationale below). |
| `verify-merge-queue` | `merge_group` only | `unit-tests`, `e2e-tests`, `automated-a11y`, `visual-tests` | Passes only if **all** jobs succeed. Enforces stricter requirements in the merge queue. |

**Rationale for E2E on PR**: Some E2E tests may be flaky. By making E2E optional on PR, the PR author can attempt to merge if they believe the tests will pass in the merge queue. The merge queue enforces that E2E must pass before merging to main.

### Branch protection configuration

Set these as **required status checks** in branch protection rules:
- `PR / verify-pr`
- `PR / verify-merge-queue`

**How it works**:
- On a **PR**: `verify-pr` runs and gates merging (unit-tests, a11y, visual must pass; e2e is informational). `verify-merge-queue` is skipped (not a `merge_group` event) so it doesn't block.
- On **merge queue**: both run. `verify-merge-queue` enforces that **all** jobs (including e2e) must pass before merging to main.
- E2E results still show ❌/✅ on the PR for visibility but don't block merging.

