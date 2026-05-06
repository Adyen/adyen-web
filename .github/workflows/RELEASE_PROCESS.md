# Release Process

## Overview

The release process is split into two phases: an **automated GitHub Release** triggered by a commit to `main`, and a **manual npm publish** triggered by a maintainer.

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
┌────────────────────────────┐
│       gh-release.yml       │
│                            │
│  - Build UMD + translations│
│  - Parse CHANGELOG.md      │
│  - Create git tag          │
│  - Create GH Release with  │
│    UMD bundle as asset     │
└────────────────────────────┘


  ── Automated phase ends here ──
  ── Manual phase begins below ──


  Maintainer clicks
  "Run workflow" in
  GitHub Actions UI
       │
       ▼
┌────────────────────────────┐
│      npm-publish.yml       │
│      (workflow_dispatch)   │
│                            │
│  - Checkout code           │
│  - Install deps            │
│  - Build & npm publish     │
│    (--tag latest)          │
└────────────────────────────┘
```

---

## Workflow Files

| File | Trigger | Purpose |
|------|---------|---------|
| `check-release-build.yml` | Push to `main` | Checks commit message for `[ci] release main` and triggers `gh-release.yml` |
| `gh-release.yml` | `workflow_dispatch` / `workflow_call` | Builds UMD + translations, parses CHANGELOG, creates a git tag and GitHub Release with the UMD bundle attached as a release asset |
| `npm-publish.yml` | `workflow_dispatch` (manual) | Builds and publishes the package to npm via OIDC |
