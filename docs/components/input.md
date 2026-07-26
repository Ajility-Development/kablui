# Input

Single-line text field with Field-aware labeling, invalid styling, and `v-model`.

## Overview

Use `Input` for short text values. Inside a `Field`, it picks up the shared control id, `aria-describedby`, and invalid state automatically. You can also set `invalid` / `id` on the control itself.

## Examples

### Basic

Inside a `Field`, `Input` picks up the shared control id and description wiring automatically.

<Demo src="./demos/input-basic.vue" />

### Sizes

`sm`, `md`, and `lg` control visual size. Native `type` values work as usual.

<Demo src="./demos/input-sizes.vue" />

### Invalid

Set `invalid` on `Field` (or the input) to show danger styling and wire `aria-invalid`.

<Demo src="./demos/input-invalid.vue" />

## Props / Models / Emits / Slots

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `string` | `'text'` | Native input `type` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size |
| `disabled` | `boolean` | `false` | Disables the input |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `placeholder` | `string` | — | Placeholder text |
| `name` | `string` | — | Native `name` |
| `id` | `string` | — | Overrides Field control id when set |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `string` | `''` | Input value |

No custom emits or slots. Extra attributes fall through to the native `<input>` (`inheritAttrs: false`, applied on the input).

## Accessibility

- Uses a native `<input>`.
- Inside `Field`, wires `id`, `aria-describedby` (hint/error), and `aria-invalid` when invalid.
- Focus styles use a visible focus ring (`focus-visible`).

## Related

- [Field](./field.md)
- [Textarea](./textarea.md)
- [Select](./select.md)
