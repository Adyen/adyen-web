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
