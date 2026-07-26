# Alert

## Overview

`Alert` shows an inline status message with an optional title and dismiss control. Use tones to communicate severity without interrupting the page flow (prefer [Toast](./toast.md) for transient notifications).

## Examples

### Tones

`tone` sets visual severity. Optional `title` sits above the body.

<Demo src="./demos/alert-tones.vue" />

### Dismissible

Dismissible alerts emit `dismiss` when the close control is activated; the parent decides visibility.

<Demo src="./demos/alert-dismissible.vue" />

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'accent' \| 'danger' \| 'success' \| 'warning'` | `'neutral'` | Visual severity |
| `title` | `string` | — | Optional heading above the body |
| `dismissible` | `boolean` | `false` | Shows a dismiss control and emits `dismiss` when activated |

### Models

None.

### Emits

| Event | Payload | Description |
| --- | --- | --- |
| `dismiss` | — | Fired when the dismiss button is clicked (`dismissible` only) |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Alert body content |

## Accessibility

- Root uses `role="alert"` when `tone` is `danger`; otherwise `role="status"`.
- Dismiss control is a `<button type="button">` with `aria-label="Dismiss"`. The × glyph is `aria-hidden`.
- Focus-visible ring styles apply to the dismiss button.

## Related

- [Toast](./toast.md) — transient notifications
- [Empty](./empty.md) — empty-state messaging
- [Stack](./stack.md)
