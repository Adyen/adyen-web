# Phase 2 Release Workflows (drafts)

Draft GitHub Actions for the Phase 2 pre-release strategy. See `release-process-improvement-phase-2-tasks.md`.

> These live here as drafts for review. GitHub only runs workflows in `.github/workflows`, so move a file there to activate it.

These workflows only create GitHub Releases with the UMD build attached. They do NOT publish to npm. After a release is created, trigger `.github/workflows/npm-publish.yml` manually on the tag it created to publish to npm.

| File | Task | Trigger | Purpose |
| :--- | :--- | :--- | :--- |
| `next-version-release.yml` | 2 | push to `next-v*` | Create the prerelease version PR, then create a prerelease GitHub Release with the UMD build on the release commit. |
| `feature-point-release.yml` | 3 | `workflow_dispatch` | Build a one off snapshot from a feature branch (e.g. `6.43.0-alpha+{commit-hash}`), tag it, and create a prerelease GitHub Release with the UMD build. The branch is not changed. |
| `hotfix-release.yml` | 4 | `workflow_dispatch` | Bump patch version, commit the new version and changelog back to the hotfix branch, and create a GitHub Release with the UMD build. |

## Notes

- All three assume at least one changeset exists on the branch.
- `next-version-release.yml` requires pre mode enabled on the branch (`.changeset/pre.json` committed). See `changeset-pre-mode-guide.md`.
- npm publishing is manual via `.github/workflows/npm-publish.yml`, run from the git tag each workflow creates.
