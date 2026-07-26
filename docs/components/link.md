# Link

## Overview

Styled anchor for in-page and external navigation. Optional `external` opens in a new tab with safe `rel`; `disabled` blocks activation without removing the element.

## Examples

### Basic

In-page `href`, `external` for new-tab links, and `disabled` for non-interactive anchors.

<Demo src="./demos/link-basic.vue" />

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | — | Destination URL (required) |
| `external` | `boolean` | `false` | Opens in a new tab with `rel="noopener noreferrer"` |
| `disabled` | `boolean` | `false` | Marks the link non-interactive (`aria-disabled`, `tabindex="-1"`) |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | Link text / content |

## Accessibility

- Renders a native `<a>` with `href`.
- When `external` is true: `target="_blank"` and `rel="noopener noreferrer"`.
- When `disabled`: sets `aria-disabled`, `tabindex="-1"`, prevents default on click, and prevents default on `Enter` / `Space` keydown.
- Focus styling uses `focus-visible` ring utilities.

## Related

- [Button](/components/button) — actions rather than navigation
- [Text](/components/text) — non-interactive copy
