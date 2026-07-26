# Icon

## Overview

Sized wrapper for a slotted SVG (no icon package). Decorative by default; pass `label` when the icon conveys meaning on its own.

## Examples

### Sizes

`sm`, `md`, and `lg` set the wrapper box. Pass `label` for a meaningful icon; omit it (or use `title` alone) for decorative.

<Demo src="./demos/icon-sizes.vue" />

Color follows `currentColor` from the parent. Pair with [Button](/components/button) for icon-only actions and put the accessible name on the button, not the decorative icon.

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Box size (`size-3` / `size-4` / `size-5`) |
| `label` | `string` | — | Accessible name; when set, exits decorative mode (`role="img"` + `aria-label`) |
| `title` | `string` | — | Native `title` tooltip only; does not change decorative vs. meaningful mode |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | SVG (or other graphic) content; sized to fill the wrapper |

## Accessibility

- Without `label`, the wrapper is decorative: `aria-hidden="true"` and no `role`.
- With `label`, sets `role="img"` and `aria-label` to that value.
- `title` alone does not exit decorative mode; use `label` for screen-reader naming.

## Related

- [Button](/components/button) — common host for icons
- [Text](/components/text) — accompanying labels
