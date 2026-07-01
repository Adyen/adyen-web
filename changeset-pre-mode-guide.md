# Changeset Pre Mode Guide (Next Major Version Branch)

This guide explains how to use changesets pre mode on a dedicated next version branch (for example `next-v7`) to produce `alpha`, `beta` and `rc` versions, and how to exit pre mode so all the accumulated changes become a single stable major release when the branch is renamed to `main`.

Each run produces a GitHub release with the build attached. Publishing to npm is a separate, tag driven step (via `.github/workflows/npm-publish.yml`) that we run from a release tag only when we want that build on npm.

Based on the [changesets prereleases guide](https://changesets.dev/guide/prereleases).

All commands use yarn, matching this repo.

## Before you start

Make one last stable release from `main` first. This clears any pending changesets so they are not swept into your first prerelease.

## 1. Enter pre mode when the next branch is created

Do this once, right after creating the `next-v7` branch.

- Enter pre mode with the `alpha` tag:

  ```bash
  yarn changeset pre enter alpha
  ```

  This creates a `.changeset/pre.json` file that stores the prerelease state. Versions will now look like `7.0.0-alpha.0`.

- Point changesets at this branch so it detects changed packages correctly. In `.changeset/config.json`, set:

  ```json
  "baseBranch": "next-v7"
  ```

- Make sure the release CI is allowed to run on `next-v7` (see task 2 in the Phase 2 task list).

- Commit the changes:

  ```bash
  git add .changeset/pre.json .changeset/config.json
  git commit -m "Enter changeset pre mode (alpha)"
  ```

Changesets are now in prerelease mode. Running `version` as usual produces `alpha` versions, and the release workflow creates a GitHub pre-release with the build.

## 2. Switch from alpha to beta to rc

You do not re-enter pre mode to change stage. Instead, edit the `tag` value directly in `.changeset/pre.json`.

- Move from alpha to beta by changing the tag:

  ```json
  {
    "tag": "beta"
  }
  ```

  The next `version` run produces `7.0.0-beta.0`.

- Later, move from beta to rc the same way:

  ```json
  {
    "tag": "rc"
  }
  ```

  The next `version` run produces `7.0.0-rc.0`.

- Commit `.changeset/pre.json` after each change.

Notes:

- You do not need to rename the branch when the tag changes. Pre mode only uses the tag for the version names.
- The prerelease counter keeps increasing across stages (for example `alpha.0`, `alpha.1`, then `beta.0`).

## 3. Exit pre mode and create the stable major release

When the major version is ready, exit pre mode so the accumulated changesets combine into one stable release.

- Set `baseBranch` in `.changeset/config.json` back to `main`, since this branch is about to become `main`:

  ```json
  "baseBranch": "main"
  ```

- Exit pre mode. This records the intent to leave prerelease mode in `pre.json`. It does not version anything by itself:

  ```bash
  yarn changeset pre exit
  ```

- Commit the changes:

  ```bash
  git add .changeset/pre.json .changeset/config.json
  git commit -m "Exit changeset pre mode"
  ```

- Run version. Because pre mode is off, changesets takes every changeset consumed during the prerelease cycle and rolls them up into the final stable version (for example `7.0.0`), with a single combined changelog entry:

  ```bash
  yarn run version
  ```

- Promote the branch instead of merging. Tag the current `main` as the previous major (for example `v6`) so it can still receive patches, then rename `next-v7` to `main`. The new `main` now carries the `7.0.0` version and combined changelog, and the normal `main` release flow takes over from there.

## Summary

| Step | Command | Result |
| :--- | :--- | :--- |
| Enter pre mode | `yarn changeset pre enter alpha` | `7.0.0-alpha.N` versions |
| Switch stage | edit `tag` in `.changeset/pre.json` | `beta` then `rc` builds |
| Exit pre mode | `yarn changeset pre exit` then `yarn run version` | stable `7.0.0` with combined changelog |
| Promote branch | tag old `main` as `v6`, rename `next-v7` to `main` | `7.0.0` ships from the new `main` |
