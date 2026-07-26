# Dialog

## Overview

Modal dialog teleported to the document body. Use it for confirmations and short focused tasks that need focus trapping, scroll lock, and dismiss via Escape, backdrop, or an optional dismiss button.

## Examples

### Basic

Open with a button, close via footer actions, Escape, backdrop, or the header dismiss control (`show-dismiss`).

<Demo src="./demos/dialog-basic.vue" />

Set `dismissible` to `false` when Escape and backdrop click should not close the dialog (the dismiss button still works when `showDismiss` is set).

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dismissible` | `boolean` | `true` | Dismiss on Escape and backdrop click |
| `showDismiss` | `boolean` | `false` | Show a dismiss button in the header (`aria-label="Dismiss"`) |
| `to` | `string \| HTMLElement` | `'body'` | Teleport target |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Whether the dialog is visible (`v-model:open`) |

### Emits

None beyond the `open` model update.

### Slots

| Slot | Description |
| --- | --- |
| `title` | Header title (`h2`); wired to `aria-labelledby` when present |
| `description` | Header description (`p`); wired to `aria-describedby` when present |
| `default` | Body content |
| `footer` | Footer actions (right-aligned cluster) |

## Accessibility

- Panel uses `role="dialog"` and `aria-modal="true"`.
- When the `title` / `description` slots are used, the panel gets `aria-labelledby` / `aria-describedby`.
- Focus is trapped inside the panel while open; body scroll is locked.
- Escape and outside (backdrop) click dismiss when `dismissible` is `true`; ownership participates in the overlay stack (`modal`).
- Optional dismiss control is a native button with `aria-label="Dismiss"`.

## Related

- [Popover](/components/popover) — non-modal floating panel
- [Tooltip](/components/tooltip) — hover/focus hint
- [Toast](/components/toast) — non-blocking notifications
