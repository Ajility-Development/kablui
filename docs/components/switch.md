# Switch

Binary on/off control with a switch appearance, Field-aware labeling, and `v-model`.

## Overview

Use `Switch` when the affordance should read as an immediate toggle (e.g. preferences) rather than a form checkbox. It is a `<button role="switch">`, not a native checkbox. Optional `name` / `value` add a hidden input for native form submission when on.

## Examples

### Basic

Toggle with an adjacent `FieldLabel`. Click, Space, or Enter flips the switch.

<Demo src="./demos/switch-basic.vue" />

## Props / Models / Emits / Slots

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Disables the switch |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `name` | `string` | — | When set, renders a hidden input for form posts |
| `id` | `string` | — | Overrides Field control id when set |
| `value` | `string` | `'on'` | Hidden input value when the switch is on |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `boolean` | `false` | On/off state |

No custom emits or slots. Extra attributes fall through to the switch button.

When `name` is set and the switch is off, the hidden input’s value is an empty string.

## Accessibility

- Root control is `<button type="button" role="switch">` with `aria-checked` `"true"` / `"false"`.
- Inside `Field`, wires `id`, `aria-describedby`, and `aria-invalid` when invalid.
- Click toggles. `Space` and `Enter` also toggle (`preventDefault` on those keys).
- Thumb decoration is `aria-hidden`.

## Related

- [Field](./field.md)
- [Checkbox](./checkbox.md)
