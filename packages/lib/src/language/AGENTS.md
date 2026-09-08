# i18n Runtime

The `Language` module injected into every component as `core.modules.i18n`. It resolves the
shopper's locale, loads translations, and formats strings, amounts, and dates.

Translation **copy** does not live here — it lives in `packages/server/translations`.

## Commands

| Task             | Command                                    |
| ---------------- | ------------------------------------------ |
| Unit tests       | `yarn test language`                       |
| Validate locales | `yarn validate:locales` from the repo root |

## Boundaries

- **Owns**: `Language.ts`, `LanguageService.ts`, `constants.ts`, `utils.ts`, `types.ts`.
- **Consumed by**: everything, via `core.modules.i18n`. `index.ts` exports `Language` only.
- **Never touches**: component folders, or the translation JSON files themselves.

## `CDN_SUPPORTED_LOCALES` is half of a two-part change

`constants.ts` exports `CDN_SUPPORTED_LOCALES`. `scripts/validate-locales.js` — a required PR check
— diffs it against the filenames in `packages/server/translations/` and **fails on a mismatch in
either direction**:

- a locale listed here with no `xx-XX.json` → "missing translation file"
- an `xx-XX.json` with no entry here → "orphaned translation file"

So adding or removing a locale is always two edits, in two packages, in the same PR.

The script parses the array with a regex anchored on `] as const;`. Reformatting the export or
dropping `as const` makes it throw before it validates anything — the failure looks unrelated to
what you changed.

## Safety

- Never hardcode a user-facing string as a fallback for a missing key. A missing key is a bug in
  `en-US.json`, not something to paper over in the runtime.
