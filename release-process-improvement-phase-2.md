# Checkout Web Release Process Improvement plan - Phase 2

**Status:** Not started

**Authors:** John Ayeni

**Date:** May 15, 2026

**YouTrack Epic:**

## Related documents

- ADR: Alpha and Beta Pre-release Strategy for adyen-web

## The problem

Today we do not have a standard, repeatable way to publish alpha and beta releases. Every time we need an early build we improvise, which is slow and easy to get wrong. Two cases are not covered by our current process:

- **New major versions.** When we work towards a big release such as `7.0.0`, we need a way to share early `alpha`, `beta` and `rc` builds while `main` keeps shipping normal patch and minor releases. We do not have a branch or workflow for this.
- **Feature branches.** When a single new feature is still in review, merchants and internal teams often want to try it before it is merged. We have no simple way to make a one off release from a feature branch that does not affect the normal stable release.

Because of this, pre-releases are slow and inconsistent, and there is no clear, visible way to track what has been released. Without a single record of every build, testers cannot easily find the right one and the team cannot see the release history at a glance.

## Goal of Phase 2 improvements

Give the team one clear strategy for pre-releases, covering both new major versions and feature branches, so that:

- Early builds are fast and consistent to create.
- Every build is tracked and easy to find via GitHub releases.
- The version numbers make it obvious what a build is (for example `7.0.0-alpha.0` or `6.43.0-alpha+{commit-hash}`).

Every pre-release always produces a GitHub release with the build attached. The npm publish is a separate, tag driven step that we do not need to trigger for every build.

## Strategy

We use two flows. Which one you use depends on what you are releasing. Both build on the changesets tooling we already use on `main`.

### 1. Pre-releases for a new major version (dedicated next branch)

For a new major version we create one long lived branch, for example `next-v7`. This branch is where all the work for the next major version lands.

How it works:

- Create the `next-v7` branch from `main`.
- Turn on changesets pre mode on this branch (starting with the `alpha` tag). From then on, running the release produces versions like `7.0.0-alpha.0`, then `7.0.0-alpha.1`, and so on.
- Keep the branch in sync with `main` periodically, so it always contains the latest fixes that ship on `main`.
- When the build is stable enough, move the pre mode tag from `alpha` to `beta`, which gives `7.0.0-beta.0`, `7.0.0-beta.1`, and later to `rc` for `7.0.0-rc.0`, `7.0.0-rc.1`.
- When the major version is ready, turn off pre mode and rename `next-v7` to `main`. This produces the final `7.0.0` release on the new `main`. The old `main` branch is kept as a tagged branch for the previous major (for example `v6`), so it can still receive patches.

Each of these produces a GitHub pre-release with the build attached, so testers can always find it. Publishing to npm is a separate step triggered from the release tag when we actually want it on npm, so the stable version is never affected.

This matches the left hand side of the release timeline diagram, where the `next-v7` branch walks through `alpha`, `beta` and `rc` before the final `7.0.0` lands on the main line.

### 2. Pre-releases for feature branches (point releases)

For a single feature that is still in a branch, we publish a one off build straight from that feature branch. We call this a point release.

How it works:

- A maintainer triggers a workflow on the feature branch by hand.
- The build uses a changeset snapshot, which creates a version that includes the commit hash, for example `6.43.0-alpha+{commit-hash}`. The commit hash makes every build unique and traceable.
- The version and changelog on the feature branch are not changed. Nothing is committed back to the branch, so the feature branch stays clean and the release history is untouched.
- A GitHub pre-release is created with the build attached. Publishing to npm is a separate step from the release tag, only when we want it on npm, so the stable version is never affected.

This lets a merchant or an internal team install and test one feature in isolation before it is merged, without any risk to the stable release.

This matches the feature branches in the diagram (Feature branch 1 to 5), each producing an alpha build tagged with a commit hash.

### Hotfix branches

The diagram also shows a hotfix branch producing `6.4.1`. A hotfix is not a pre-release, but it needs the same care: we branch off, fix the issue, cut a release, and write the new version and changelog back to the branch so history stays correct. This is covered as a task in the accompanying task list.

## Summary

| Case | Branch | Version example | Release type | Writes back to branch |
| :--- | :--- | :--- | :--- | :--- |
| New major version | `next-v{major}` (for example `next-v7`), renamed to `main` at the end | `7.0.0-alpha.0`, `7.0.0-beta.0`, `7.0.0-rc.0` | GitHub pre-release | Yes |
| Feature preview | feature branch from `main` | `6.43.0-alpha+{commit-hash}` | GitHub pre-release | No |
| Hotfix | hotfix branch from `main` | `6.4.1` | GitHub release | Yes |

A GitHub release is always created. npm publishing is a separate step triggered from the release tag, so it does not have to happen for every build.

## Phase 2 deliverables

See the accompanying task list in `release-process-improvement-phase-2-tasks.md`.
