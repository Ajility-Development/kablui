# Checkbox

Boolean checkbox with optional indeterminate state and Field-aware labeling.

## Overview

Use `Checkbox` for on/off choices. Pair it with `FieldLabel` inside `Field` so click-to-focus/toggle wiring stays correct. Supports `indeterminate` for a mixed state (DOM `indeterminate` + `aria-checked="mixed"`).

## Examples

### Basic

Pair `Checkbox` with `FieldLabel` inside `Field` so click-to-focus and id wiring stay correct.

<Demo src="./demos/checkbox-basic.vue" />

### Indeterminate

Set `indeterminate` for a mixed state (`aria-checked="mixed"` and the native indeterminate property).

<Demo src="./demos/checkbox-indeterminate.vue" />

## Props / Models / Emits / Slots

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `indeterminate` | `boolean` | `false` | Sets the native indeterminate property |
| `disabled` | `boolean` | `false` | Disables the checkbox |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `name` | `string` | — | Native `name` |
| `value` | `string` | `'on'` | Native `value` when checked |
| `id` | `string` | — | Overrides Field control id when set |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `boolean` | `false` | Checked state |

No custom emits or slots. Extra attributes fall through to the native `<input type="checkbox">`.

## Accessibility

- Native checkbox input.
- Sets `aria-checked` to `'true'` / `'false'`, or `'mixed'` when `indeterminate`.
- Inside `Field`, wires `id`, `aria-describedby`, and `aria-invalid` when invalid.
- Focus styles use a visible focus ring (`focus-visible`).

## Related

- [Field](./field.md)
- [Switch](./switch.md)
- [RadioGroup](./radio-group.md)
