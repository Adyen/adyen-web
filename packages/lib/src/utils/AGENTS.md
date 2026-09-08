# Utils

Shared helpers: amount formatting, browser detection, regex, validation, formatters, clipboard,
debounce, script loading, storage, focus handling, and a few Preact hooks.

## Commands

| Task       | Command           |
| ---------- | ----------------- |
| Unit tests | `yarn test utils` |
| Type check | `yarn type-check` |

## Boundaries

- **Owns**: every file in this directory, plus `Formatters/`, `Validator/`, `constants/`,
  `useForm/`.
- **Consumed by**: `core/` and `components/`. This is the shared bottom layer.

### Dependency direction

The intent is that `utils/` is a leaf: `core/` and `components/` import from it, not the reverse.
That is not literally true today, so know what you're walking into:

- `utils/` legitimately imports from `core/` (`Context/Resources`, `Errors/AdyenCheckoutError`,
  `Analytics`, `config`) and from `language/`.
- A handful of files reach into `components/`, which is the direction we don't want:
  `get-process-message-handler.ts`, `setFocus.ts`, and `Validator/defaultRules.ts`.

**Rule for new code**: do not add a new import from `utils/` into `components/`. If a utility
needs component code, either invert the dependency (pass the value in as an argument) or move the
utility next to its consumer. Don't cite the existing exceptions as precedent.

## Conventions

- Prefer pure functions — same inputs, same outputs, no side effects. Some files are unavoidably
  impure (`Storage.ts`, `clipboard.ts`, `Script.ts`, `windowScrollTo.ts`, `setFocus.ts`); keep the
  impurity contained and obvious from the filename.
- Keep functions deterministic and injectable. Don't reach for `Date.now()` or randomness inside a
  helper without allowing it to be passed in — it makes the function untestable.
- Colocate tests as `[name].test.ts` next to `[name].ts`. Every new utility needs one.
- General-purpose hooks live here (`useForm/`, `useAutoFocus.ts`, `useIsMobile.ts`,
  `hookUtils.ts`). They use `preact/hooks` and follow the normal hooks rules. A hook that owns a
  domain and its own state machine goes in `src/hooks/` instead (`usePaymentStatusTimer`) — the
  split is "generic helper" versus "feature logic that happens to be a hook".
- `constants/` holds values only, no logic. `Formatters/` handles string and data formatting.
  `Validator/` holds validation logic and rules.

## Safety

- Never add a dependency on an external package without approval — this directory is imported
  almost everywhere, so anything added here lands in every bundle.
- Never introduce DOM access or API calls into a helper that is currently pure.
