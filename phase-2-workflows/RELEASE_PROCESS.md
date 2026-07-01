# Release Process (with Phase 2 workflows)

## Overview

The release process creates a **GitHub Release** (with the UMD build attached) and then a **manual npm publish** triggered by a maintainer from the release tag.

On top of the existing `main` flow, Phase 2 adds three more entry points:

- **Next version branch** (`next-v*`) for `alpha` / `beta` / `rc` builds of a new major version.
- **Feature branch** point (snapshot) builds for previewing a single feature.
- **Hotfix branch** releases for urgent patches.

Every flow ends the same way: a GitHub Release is created, and npm publishing is a separate step run from the tag.

---

## Main branch flow (existing)

```text
  Push to main
       │
       ▼
┌──────────────────────────┐
│  check-release-build.yml │
│  Checks commit msg for   │
│  "[ci] release main"     │
└────────────┬─────────────┘
             │ (if matched)
             ▼
┌────────────────────────────┐
│       gh-release.yml       │
│  - Build UMD + translations│
│  - Parse CHANGELOG.md      │
│  - Create git tag          │
│  - Create GH Release       │
│    (--latest) with UMD zip │
└────────────────────────────┘

  ── Manual npm publish ──

  Maintainer runs npm-publish.yml
  from the release tag (e.g. v6.20.0)
```

---

## Next version branch flow (Task 2 - `next-version-release.yml`)

For a new major version on a `next-v*` branch with changeset pre mode enabled. See `changeset-pre-mode-guide.md`.

```text
  Push to next-v*
       │
       ├─ normal commit ──▶ version-pr job
       │                    (creates/updates the prerelease version PR)
       │
       └─ "[ci] release next-v" commit ──▶ gh-release job
                                           - Build UMD + translations
                                           - Parse CHANGELOG.md
                                           - Create git tag
                                           - Create GH Release
                                             (--prerelease) with UMD zip

  ── Manual npm publish ──
  Maintainer runs npm-publish.yml from the prerelease tag
```

> Versions come from pre mode: `7.0.0-alpha.0`, `7.0.0-beta.0`, `7.0.0-rc.0`. When the major is ready, exit pre mode and rename `next-v7` to `main` (the old `main` is tagged as `v6`).

---

## Feature point release flow (Task 3 - `feature-point-release.yml`)

For a one off preview build of a feature branch. Does not change the branch.

```text
  Maintainer runs feature-point-release.yml
  (workflow_dispatch on the feature branch)
       │
       ▼
┌────────────────────────────────────┐
│  - changeset version --snapshot     │
│    (e.g. 6.43.0-alpha+{commit-hash})│
│  - Build UMD + translations         │
│  - Tag the snapshot version         │
│    (branch is NOT updated)          │
│  - Create GH Release (--prerelease) │
│    with UMD zip                     │
└────────────────────────────────────┘

  ── Manual npm publish ──
  Maintainer runs npm-publish.yml from the snapshot tag
```

---

## Hotfix release flow (Task 4 - `hotfix-release.yml`)

For an urgent patch from a hotfix branch. Writes the new version and changelog back to the branch.

```text
  Maintainer runs hotfix-release.yml
  (workflow_dispatch on the hotfix branch)
       │
       ▼
┌────────────────────────────────────┐
│  - yarn run version (patch bump)    │
│    (e.g. 6.4.0 -> 6.4.1)            │
│  - Build UMD + translations         │
│  - Parse CHANGELOG.md               │
│  - Commit version + changelog       │
│    back to the hotfix branch        │
│  - Create git tag                   │
│  - Create GH Release (--latest)     │
│    with UMD zip                     │
└────────────────────────────────────┘

  ── Manual npm publish ──
  Maintainer runs npm-publish.yml from the hotfix tag
```

> After the release, the developer must merge the hotfix branch back into `main` so the fix, version bump, and changelog are not lost.

---

> **Important:** When triggering `npm-publish.yml`, the maintainer **must select the git tag of the version they intend to publish** in the "Use workflow from" dropdown. Running it against a branch can publish a different version than the one the release created. Tags are created automatically by each release workflow.

---

## Workflow Files

| File | Location | Trigger | Purpose |
| --- | --- | --- | --- |
| `check-release-build.yml` | `.github/workflows` | Push to `main` | Checks commit message for `[ci] release main` and triggers `gh-release.yml` |
| `gh-release.yml` | `.github/workflows` | `workflow_dispatch` / `workflow_call` | Builds UMD + translations, parses CHANGELOG, creates a git tag and GitHub Release (`--latest`) with the UMD bundle attached |
| `npm-publish.yml` | `.github/workflows` | `workflow_dispatch` (run from the release tag) | Builds and publishes the package to npm via OIDC |
| `next-version-release.yml` | `phase-2-workflows` | Push to `next-v*` | Creates the prerelease version PR, then a prerelease GitHub Release with the UMD build on the release commit |
| `feature-point-release.yml` | `phase-2-workflows` | `workflow_dispatch` | Builds a snapshot (`6.43.0-alpha+{commit-hash}`), tags it, and creates a prerelease GitHub Release with the UMD build. The branch is not changed |
| `hotfix-release.yml` | `phase-2-workflows` | `workflow_dispatch` | Bumps the patch version, commits the version and changelog back to the branch, and creates a GitHub Release with the UMD build |

> The Phase 2 workflows currently live in `phase-2-workflows/` as drafts. GitHub only runs workflows in `.github/workflows`, so move a file there to activate it.
