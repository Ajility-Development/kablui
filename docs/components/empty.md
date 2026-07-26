# Empty

## Overview

`Empty` is a centered empty-state layout with optional icon, title, body, and action slots. Use it when a list, table, or search has no results.

## Examples

### Basic

Optional `icon`, `title`, default body, and `action` slots compose a full empty state. Title-only or body-only variants work; each region renders only when provided.

<Demo src="./demos/empty-basic.vue" />

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Optional heading |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `icon` | Optional leading icon or illustration |
| `default` | Supporting body copy |
| `action` | Optional CTA (for example a button) |

## Accessibility

No ARIA roles or live regions are applied by `Empty`. Provide accessible content in slots (for example an [Icon](./icon.md) with a `label`, or a clear `title` and body). Actions should be real focusable controls.

## Related

- [Alert](./alert.md) — inline status messages
- [Icon](./icon.md)
- [Button](./button.md)
- [Skeleton](./skeleton.md) — loading placeholders
