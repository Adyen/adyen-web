# Release Process

## Overview

The release process is split into two phases: an **automated build** triggered by a commit to `main`, and a **manual release & publish** triggered by a maintainer.

---

## Workflow Diagram

```
  Push to main
       │
       ▼
┌──────────────────────────┐
│  check-release-build.yml │
│                          │
│  Checks if commit msg    │
│  contains                │
│  "[ci] release main"     │
└────────────┬─────────────┘
             │
             │ (if matched)
             ▼
┌──────────────────────────┐
│    release-build.yml     │
│                          │
│  Builds the release      │
│  artifacts               │
└──────────────────────────┘


  ── Automated phase ends here ──
  ── Manual phase begins below ──


  Maintainer clicks
  "Run workflow" in
  GitHub Actions UI
       │
       ▼
┌──────────────────────────────┐
│  release-and-publish.yml     │
│  (workflow_dispatch)         │
│                              │
│  ┌────────────────────────┐  │
│  │  1. gh-release.yml     │  │
│  │                        │  │
│  │  - Parse CHANGELOG.md  │  │
│  │  - Create git tag      │  │
│  │  - Create GH Release   │  │
│  └───────────┬────────────┘  │
│              │               │
│              │ (on success)  │
│              ▼               │
│  ┌────────────────────────┐  │
│  │  2. npm-publish.yml    │  │
│  │                        │  │
│  │  - Checkout code       │  │
│  │  - Install deps        │  │
│  │  - Build & npm publish │  │
│  │    (--tag latest)      │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

---

## Workflow Files

| File | Trigger | Purpose |
|------|---------|---------|
| `check-release-build.yml` | Push to `main` | Checks commit message for `[ci] release main` and triggers the release build |
| `release-build.yml` | `workflow_call` | Builds the release artifacts |
| `release-and-publish.yml` | `workflow_dispatch` (manual) | Orchestrates the GH release and npm publish steps |
| `gh-release.yml` | `workflow_dispatch` / `workflow_call` | Parses CHANGELOG, creates a git tag and GitHub Release |
| `npm-publish.yml` | `workflow_call` | Builds and publishes the package to npm via OIDC |

## Key Design Decisions

- **Two-phase approach**: The release build runs automatically on push, but creating the GitHub Release and publishing to npm requires a manual trigger. This gives maintainers a gate to verify the build before publishing.

- **Sequential execution**: `npm-publish` declares `needs: gh-release`, ensuring the git tag and GitHub Release exist before the npm publish runs. The npm publish step uses `--tag latest` to mark the published version as the latest on npm.

- **No tag passthrough**: `npm-publish.yml` does not need the tag passed as an input — it checks out `main` and publishes from there. The `needs` dependency simply ensures the GH release (and its tag) is created first.

- **Reusable workflows**: Both `gh-release.yml` and `npm-publish.yml` are callable via `workflow_call`, keeping them independently runnable (`gh-release.yml` also supports `workflow_dispatch`) while composable through `release-and-publish.yml`.
