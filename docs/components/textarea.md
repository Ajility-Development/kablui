# Textarea

Multi-line text field with Field-aware labeling, invalid styling, and `v-model`.

## Overview

Use `Textarea` for longer plain-text values. Behavior matches `Input` for Field context, sizes, and invalid/disabled states, with a `rows` prop for height.

## Examples

### Basic

Use `Textarea` with `Field` for longer plain-text values. Adjust height with `rows`.

<Demo src="./demos/textarea-basic.vue" />

## Props / Models / Emits / Slots

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size |
| `rows` | `number` | `3` | Native `rows` |
| `disabled` | `boolean` | `false` | Disables the textarea |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `placeholder` | `string` | — | Placeholder text |
| `name` | `string` | — | Native `name` |
| `id` | `string` | — | Overrides Field control id when set |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `string` | `''` | Textarea value |

No custom emits or slots. Extra attributes fall through to the native `<textarea>`.

## Accessibility

- Uses a native `<textarea>`.
- Inside `Field`, wires `id`, `aria-describedby`, and `aria-invalid` when invalid.
- Focus styles use a visible focus ring (`focus-visible`).

## Related

- [Field](./field.md)
- [Input](./input.md)
