---
name: generate-changeset
description: Generate a @changesets entry for the current branch
argument-hint: "[patch|minor|major]"
---

Generate a `.changeset/*.md` file for the current branch. CI validation lives in
`.github/workflows/validate-changesets.yml`; match the style of existing `.changeset/*.md` files.

## Conventions

- Any change under `packages/lib/src/**` (excluding test files like `*.test.ts` or `*.spec.ts`)
  needs a real changeset. If the branch only touches excluded files or files outside
  `packages/lib/src/**`, create an empty changeset.
- A real changeset's package is `'@adyen/adyen-web'` and the bump level is `patch`, `minor`, or
  `major`.
- The summary must be exactly one non-empty line, one sentence, starting with one of these
  exact prefixes (note the single space after the colon):
  - `Improved:` — behavior enhancement or quality improvement.
  - `New:` — new feature, payment method, public callback, or user-visible capability.
  - `Fixed:` — bug fix, a11y fix, type fix, or regression correction.
- Do not add a PR reference, link, or number.

## Steps

1. `git fetch origin main`, then `git merge-base origin/main HEAD` to find the merge base.
2. Review the changes: `git diff --name-only <merge-base>..HEAD` for affected files and
   `git log <merge-base>..HEAD --oneline` for context.
3. Decide real vs empty per the conventions above.
4. If empty: run `yarn changeset:empty`.
5. If real:
   a. Pick the bump level — use the user's explicit argument if given, otherwise classify:
      `major` — a deliberate breaking change or required migration; `minor` — new user-facing
      feature, public API, or payment-method support; `patch` — bug fixes, a11y tweaks, internal
      type fixes, refactors, style changes.
   b. Run `yarn changeset` in an interactive terminal and answer the prompts: select
      `@adyen/adyen-web`, choose the bump level, and enter the summary as a single line.
   c. Read the generated `.changeset/<name>.md` and confirm it matches the conventions above.
6. Output the file path and its full contents. Do not stage, commit, or run `changeset version`.
