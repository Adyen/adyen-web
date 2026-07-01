# Phase 2 Tasks - Alpha and Beta Release Strategy

Tasks needed to deliver the Phase 2 pre-release strategy. See `release-process-improvement-phase-2.md` for the full plan.

## 1. Create a next version branch with changeset pre mode enabled

Set up the long lived branch for the next major version (for example `next-v7`).

- Branch off `main` and name it `next-v{major}`.
- Enter changeset pre mode with the `alpha` tag (`changeset pre enter alpha`).
- Commit the generated `.changeset/pre.json` so pre mode stays on for the branch.
- Document how to move from `alpha` to `beta` to `rc`, and how to exit pre mode. At the end the branch is renamed to `main` (the old `main` is tagged as the previous major, e.g. `v6`) instead of being merged. See `changeset-pre-mode-guide.md`.

Refer to parent ticket: https://youtrack.is.adyen.com/issue/CO-179/Q3-2026-Automation-Optimization-of-Adyen-Web-Release-Process-Phase-2

## 2. Release workflow for the next version branch

Add a workflow that runs on the next version branch to cut pre-releases, based on the existing `.github/workflows/release.yml`.

- Trigger on push to `next-v*`.
- Reuse the changesets action, but keep pre mode on so versions become `7.0.0-alpha.0`, `7.0.0-beta.0`, and so on.
- Reuse the GitHub release step from `gh-release.yml`, but mark the release as a pre-release (not `--latest`) with the UMD build attached.
- Do not publish to npm here. npm publishing stays manual via `.github/workflows/npm-publish.yml`, run from the tag this workflow creates.

Refer to parent ticket: https://youtrack.is.adyen.com/issue/CO-179/Q3-2026-Automation-Optimization-of-Adyen-Web-Release-Process-Phase-2

## 3. Point release workflow for feature branches

Add a workflow that a maintainer runs by hand on a feature branch to publish a one off preview build.

- Trigger with `workflow_dispatch` so it only runs when chosen.
- Use a changeset snapshot to build a version with the commit hash (for example `6.43.0-alpha+{commit-hash}`). Set the snapshot `prereleaseTemplate` in `.changeset/config.json` to `{tag}+{commit}` to get the `+` separator.
- Do not commit any version or changelog change back to the feature branch.
- Create a prerelease GitHub Release with the UMD build attached. Do not publish to npm here; npm publishing stays manual via `.github/workflows/npm-publish.yml` on the tag this workflow creates.

Refer to parent ticket: https://youtrack.is.adyen.com/issue/CO-179/Q3-2026-Automation-Optimization-of-Adyen-Web-Release-Process-Phase-2

## 4. Hotfix release workflow

Add a workflow to cut a release from a hotfix branch and write the changes back.

- Trigger with `workflow_dispatch` on the hotfix branch.
- Run changeset version to bump the patch version and update the changelog (for example `6.4.0` to `6.4.1`).
- Reuse the GitHub release step from `gh-release.yml` (parse the changelog, attach the UMD build).
- Do not publish to npm here; npm publishing stays manual via `.github/workflows/npm-publish.yml` on the tag this workflow creates.
- Commit the new version and changelog back to the hotfix branch.

Refer to parent ticket: https://youtrack.is.adyen.com/issue/CO-179/Q3-2026-Automation-Optimization-of-Adyen-Web-Release-Process-Phase-2
