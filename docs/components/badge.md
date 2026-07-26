# Badge

## Overview

Compact status label for short text. Supports the full status tone set (neutral, accent, danger, success, warning) and small, medium, and large sizes.

## Examples

### Tones and sizes

All status tones plus `sm` / `lg` size samples.

<Demo src="./demos/badge-tones.vue" />

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'accent' \| 'danger' \| 'success' \| 'warning'` | `'neutral'` | Color treatment |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding and text size |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | Badge label |

## Accessibility

- Renders a `<span>` with no ARIA attributes.
- Convey status in the visible text (or pair with nearby labeled content); the component does not expose a role or live region.

## Related

- [Text](/components/text) — longer copy
- [Alert](/components/alert) — prominent inline messages
