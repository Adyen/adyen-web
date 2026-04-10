# Select Component Split Plan

## Goal

Split the single `Select` component into two distinct implementations — `SelectOnly` (button+listbox pattern) and `ComboboxSelect` (combobox pattern) — with a thin `Select` wrapper preserving the existing public API. Simultaneously fix missing ARIA attributes on the select-only trigger (ticket requirement).

## Current failing tests (intentional — fixed by this plan)

- `select-only › aria-expanded is false initially and true when open`
- `select-only › button has aria-haspopup="listbox"`

---

## Steps

### Step 1 — Create `SelectTriggerButton.tsx`

New file. Owns the **button+listbox** ARIA pattern.

Extracts from `SelectButton.tsx`:

- The `<button>` element (currently `SelectButtonElement` non-filterable branch)
- Its children: icon + `<span>` with `displayText` + `secondaryText`

Adds the missing ARIA (ticket fix):

- `aria-haspopup="listbox"`
- `aria-expanded` (as string `"true"`/`"false"`)
- `aria-controls={selectListId}`

Does **not** include: `setFocus`, `filterInputRef`, `displayInputText`, `currentSelectedItemId`.

---

### Step 2 — Create `SelectTriggerCombobox.tsx`

New file. Owns the **combobox** ARIA pattern.

Extracts from `SelectButton.tsx`:

- The `<div>` wrapper
- The `<input role="combobox">` and all its ARIA attrs (`aria-autocomplete`, `aria-controls`, `aria-expanded`, `aria-owns`, `aria-activedescendant`)
- The `setFocus` click handler
- `displayInputText` logic
- `currentSelectedItemId`

---

### Step 3 — Simplify `SelectButton.tsx` → thin picker

Replace all internal branching with a single `if`:

```tsx
if (props.filterable) return <SelectTriggerCombobox {...props} />;
return <SelectTriggerButton {...props} />;
```

Delete: `SelectButtonElement`, `setFocus`, `onClickHandler` ternary, both content `Fragment`s, `isShowingPlaceholder`, `displayText`, `displayInputText`, `currentSelectedItemId`.

---

### Step 4 — Create `SelectOnly.tsx`

New file. Non-filterable implementation.

**Takes from `Select.tsx`:**

- Shared state/refs: `selectContainerRef`, `toggleButtonRef`, `selectListRef`, `showList`, `statusMessage`, `selectListId`, `activeOption`, `selectedOption`
- `openList`, `extractItemFromEvent`, `handleHover`, `scrollToItem`, `setNextActive`, `setPreviousActive`, `handleNavigationKeys`
- Simplified `closeList` — no `filterInputRef.current.blur()`
- Simplified `handleSelect` — no `textFilter` branch, no `clearOnSelect`
- Simplified `handleButtonKeyDown` — no `filterable &&` guard on Enter, Space always toggles
- Simple `toggleList` — just open/close, no `inputText` management
- Click-outside effect, status message effect, `onListToggle` effect

**Does NOT accept props:** `onInput`, `disableTextFilter`, `clearOnSelect`, `blurOnClose`

**Renders:** `<SelectTriggerButton>` + `<SelectList>` + status `<div>`

---

### Step 5 — Create `ComboboxSelect.tsx`

New file. Filterable/combobox implementation.

**Takes from `Select.tsx`:** Everything in `SelectOnly` plus:

- `filterInputRef`, `textFilter`, `inputText` state
- Full `closeList` with `blurOnClose && filterInputRef.current.blur()`
- Full `handleSelect` with `textFilter` and `clearOnSelect` branches
- Full `handleButtonKeyDown` with Enter+filter branch and Space guard (`!filterable || !showList` → just `!showList`)
- `handleTextFilter`, full `toggleList` (manages `inputText`)
- Combobox-specific effects: reset `inputText`/`textFilter` on open/close; focus filter input on open
- `filteredItems` computation (with `disableTextFilter`)

**Renders:** `<SelectTriggerCombobox>` + `<SelectList>` + status `<div>`

---

### Step 6 — Reduce `Select.tsx` to a wrapper

```tsx
function Select(props: Readonly<SelectProps>) {
    if (props.filterable) return <ComboboxSelect {...props} />;
    return <SelectOnly {...props} />;
}
```

All state, refs, handlers, and effects are deleted from this file. `defaultProps` stays.

---

### Step 7 — Verify tests

Run full suite. Expect:

- 19/19 in `Select.test.tsx` — the 2 previously failing tests now pass
- 0 regressions across the other 244 suites

---

## File map after split

```
Select/
  Select.tsx                     ← wrapper only (~10 lines)
  SelectOnly.tsx                 ← new: button+listbox implementation
  ComboboxSelect.tsx             ← new: combobox implementation
  components/
    SelectButton.tsx             ← thin picker (~5 lines)
    SelectTriggerButton.tsx      ← new: button+listbox trigger + ARIA fix
    SelectTriggerCombobox.tsx    ← new: combobox trigger
    SelectList.tsx               ← unchanged
    SelectListItem.tsx           ← unchanged
  types.ts                       ← unchanged
  constants.ts                   ← unchanged
  Select.test.tsx                ← unchanged (single file, split later)
```

## Execution order

Steps 1–3 first (trigger-level split, `SelectButton` still works during transition), then 4–6 (implementation split, `Select.tsx` becomes wrapper), then 7 (verify). Each step should leave tests passing except the 2 intentional failures which turn green at step 7.
