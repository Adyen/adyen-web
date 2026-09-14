---
name: generate-changeset
description: Generate a @changesets entry for the current branch
argument-hint: "[patch|minor|major]"
---

Generate a `.changeset/*.md` file for the current branch, following the Adyen/adyen-web conventions and the CI validation in `.github/workflows/validate-changesets.yml`.

## Conventions to follow

Reference `packages/lib/CHANGELOG.md`, `.changeset/*.md`, `AGENTS.md`, and `.github/workflows/validate-changesets.yml`.

- Any change under `packages/lib/src/**` (excluding test files like `*.test.ts` or `*.spec.ts`) needs a real changeset.
- If the branch only touches excluded files or files outside `packages/lib/src/**`, create an empty changeset:
  ```markdown
  ---
  ---
  ```
- For a real changeset, the package is `'@adyen/adyen-web'` and the bump level is `patch`, `minor`, or `major`.
- The description (everything after the second `---`) must be exactly one single non-empty line.
- That one line must start with one of these exact prefixes:
  - `Improved:` — behavior enhancement or quality improvement.
  - `New:` — new feature, payment method, public callback, or user-visible capability.
  - `Fixed:` — bug fix, a11y fix, type fix, or regression correction.
- There must be exactly one space after the colon.
- Keep the summary to a single sentence. Do not add a PR reference, link, or number.
- Choose a short hyphenated filename for `.changeset/<slug>.md` (e.g. `fix-a11y-issue.md`). Check that the file name does not already exist.

## Steps

1. Identify the current branch with `git rev-parse --abbrev-ref HEAD`.
2. Fetch the latest main branch with `git fetch origin main`. 
3. Find the merge base against `origin/main` with `git merge-base origin/main HEAD`, then:
   - `git diff --name-only <merge-base>..HEAD` to see affected files.
   - `git log <merge-base>..HEAD --oneline` to understand the context and purpose of the changes.
4. Read `.changeset/config.json`, `.github/workflows/validate-changesets.yml`, and existing `.changeset/*.md` files to match the style and validation rules.
5. Decide whether the branch needs a real or empty changeset:
   - If any changed path is under `packages/lib/src/**` (and is not a test file), a real changeset is required.
   - Otherwise, create an empty changeset.
6. If a real changeset is needed, decide the bump level:
   - Use the user's explicit argument if provided.
   - Otherwise classify from the diff and commit messages:
     - `major` — a deliberate breaking change or required migration step.
     - `minor` — a new user-facing feature, public API, or new component/payment-method support.
     - `patch` — bug fixes, a11y tweaks, internal type fixes, refactors, or style changes.
7. Draft a one-sentence summary starting with `Improved: `, `New: `, or `Fixed: ` (with the space). Do not add a PR reference, link, or number. Do not add any line breaks after the first content line.
8. Pick a unique `<slug>` for the `.changeset/<slug>.md` file. Run `git ls-files .changeset/*.md` to avoid collisions.
9. Create the file at `.changeset/<slug>.md` with the exact content, including a trailing newline.

   For an empty changeset:
   ```markdown
   ---
   ---
   ```

   For a real changeset:
   ```markdown
   ---
   '@adyen/adyen-web': <bump>
   ---

   <Prefix>: <one sentence summary>
   ```

10. Output the file path and its full contents. Do not stage, commit, or run `npx changeset` version commands.