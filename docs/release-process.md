# Release Process

## Overview

The release process creates a **GitHub Release** (with the UMD build attached) and then a **manual npm publish** triggered by a maintainer from the release tag.

- **Main branch** releases for stable versions.
- **Next version branch** (`next-v*`) for `alpha` / `beta` / `rc` builds of a new major version.
- **Pull request** point (snapshot) builds for previewing a single feature.

Every flow ends the same way: a GitHub Release is created, and npm publishing is a separate step run from the tag.

---

## Main branch flow

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

## Next version branch flow

For a new major version on a `next-v*` branch with changeset pre mode enabled. See [next version release guide](../../docs/next-major-version-guide.md).

```text
  Push to next-v*
       │
       ├─ normal commit ──▶ version-pr job
       │                    (creates/updates the prerelease version PR)
       │
       └─ "[ci] release next-v{version}" commit ──▶ gh-release job
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

## Snapshot release flow (`release-snapshot.yml`)

For a one off alpha preview build of a pull request. Does not change the branch.

The only trigger is the **`release-alpha` label** on a pull request. Adding the label starts a build from the PR's source branch head (not the merge commit); the workflow cannot be started manually. The label is **removed automatically when the run finishes**, whether it succeeded or failed, so adding it again is all that is needed for another build.

```text
  Maintainer adds the `release-alpha` label to a PR
       │
       ▼
┌─────────────────────────────────────┐
│  - Fail unless the PR is approved   │
│  - Checkout PR head (source branch) │
│  - changeset version --snapshot     │
│    (e.g. 6.43.0-alpha.{commit-hash})│
│  - Build UMD + translations         │
│  - Tag the snapshot version         │
│    (branch is NOT updated)          │
│  - Create GH Release (--prerelease) │
│    with UMD zip, notes link the PR  │
│  - Comment the release link on PR   │
│  - Remove the label (always)        │
└─────────────────────────────────────┘

  ── Manual npm publish ──
  Maintainer runs npm-publish.yml from the snapshot tag
```

Requirements and caveats:

- The PR needs **an active approving review**. The workflow fails immediately if there is none, or if the approver's latest review is "changes requested" or their approval was dismissed.
- The branch needs **at least one changeset**, otherwise the snapshot version cannot be computed.
- Only works for PRs from branches in this repository. Fork PRs get a read-only token, so tagging and commenting fail.

---
> **Important:** When triggering `npm-publish.yml`, the maintainer **must select the git tag of the version they intend to publish** in the "Use workflow from" dropdown. Running it against a branch can publish a different version than the one the release created. Tags are created automatically by each release workflow.

---

## Workflow Files

| File | Location | Trigger | Purpose |
| --- | --- | --- | --- |
| `check-release-build.yml` | `.github/workflows` | Push to `main` or `next-v*` | Checks commit message for `[ci] release main` or `[ci] release next-v{version}` and triggers `gh-release.yml` |
| `gh-release.yml` | `.github/workflows` | `workflow_dispatch` / `workflow_call` | Builds UMD + translations, parses CHANGELOG, creates a git tag and GitHub Release (`--latest` or `--prerelease`) with the UMD bundle attached |
| `npm-publish.yml` | `.github/workflows` | `workflow_dispatch` (run from the release tag) | Builds and publishes the package to npm via OIDC |
| `release-snapshot.yml` | `.github/workflows` | `release-alpha` label added to an approved PR | Builds a snapshot (`6.43.0-alpha.{commit-hash}`) from the PR's source branch, tags it, creates a prerelease GitHub Release with the UMD build linking the PR, comments the release link on the PR, and removes the label again. The branch is not changed |
