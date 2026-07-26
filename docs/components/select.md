# Select

Custom listbox select with Field-aware labeling. Options via an `options` prop or nested `SelectItem` children.

## Overview

Use `Select` for a single string value from a list. Prefer the `options` prop for data-driven lists, or compose with `SelectItem` for markup-driven options. If both are present, the `options` prop wins (and a console warning is emitted). Optional `name` adds a hidden input for native form posts.

The listbox teleports to `body`, positions with `useFloating`, and dismisses via the shared dismissible overlay stack (`menu` layer).

## Examples

### Options prop

Data-driven list via `options`. Prefer this when options come from an array.

<Demo src="./demos/select-options.vue" />

### SelectItem children

Compose options in markup with `SelectItem`. If both APIs are present, `options` wins.

<Demo src="./demos/select-items.vue" />

## Props / Models / Emits / Slots

### Select

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `SelectOption[]` | — | Declarative options; omit when using `SelectItem` |
| `placeholder` | `string` | `'Select…'` | Trigger text when nothing is selected |
| `disabled` | `boolean` | `false` | Disables the trigger |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `name` | `string` | — | When set, renders a hidden input with the selected value |
| `id` | `string` | — | Overrides Field control id on the trigger |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Trigger and option size |

`SelectOption`: `{ value: string; label: string; disabled?: boolean }`.

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `string` | — | Selected option value |

| Slot | Description |
| --- | --- |
| `default` | `SelectItem` children (used when `options` is empty / omitted) |

No custom emits. Extra attributes fall through to the trigger button.

### SelectItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | **Required.** Option value |
| `disabled` | `boolean` | `false` | Disables this option |
| `label` | `string` | — | Explicit trigger label; defaults to slot text, then `value` |

| Slot | Description |
| --- | --- |
| `default` | Option label content (falls back to `value`) |

Must be used inside `Select` (warns in the console otherwise).

## Accessibility

- Trigger is a button with `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, and Field-wired `id` / `aria-describedby` / `aria-invalid`.
- Popup has `role="listbox"` and `aria-activedescendant` for the active option.
- Options use `role="option"` with `aria-selected` and `aria-disabled` when disabled.
- Keyboard (trigger and open listbox):
  - `ArrowDown` / `ArrowUp` — open if closed; move active option when open
  - `Home` / `End` — first / last enabled option when open
  - `Enter` / `Space` — open, or select the active option when open
  - `Escape` — close and return focus to the trigger
  - Printable characters — typeahead (opens if closed); matches option labels
- Escape and outside pointer dismiss via the dismissible layer (`menu` stack).
- Selecting an option closes the listbox and focuses the trigger.

## Related

- [Field](./field.md)
- [RadioGroup](./radio-group.md)
- [Input](./input.md)
