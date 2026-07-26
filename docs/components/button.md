# Button

## Overview

Native `<button>` for actions and CTAs. Supports solid, outline, and ghost variants; three sizes; and a disabled state that blocks clicks.

## Examples

### Variants and sizes

`solid`, `outline`, and `ghost` control visual style. `sm` / `md` / `lg` set padding and text size. `disabled` blocks clicks.

<Demo src="./demos/button-variants.vue" />

### With icon

Slot an `Icon` beside the label, or use an icon-only button with an accessible name (`aria-label`).

<Demo src="./demos/button-with-icon.vue" />

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding and text size |
| `disabled` | `boolean` | `false` | Disables the button and ignores clicks |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button `type` |

### Models

None.

### Emits

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `MouseEvent` | Fired on click when not disabled |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Button content (label, icons, etc.) |

## Accessibility

- Renders a native `<button>` with `type` and `disabled` wired through.
- When `disabled`, the click handler returns early and does not emit `click`.
- Focus styling uses `focus-visible` ring utilities on the button.
- Icon-only usage should set an accessible name on the button (e.g. `aria-label`); the component does not add one automatically.

## Related

- [Icon](/components/icon) — slotted SVG for buttons
- [Link](/components/link) — navigation instead of actions
- [Text](/components/text) — typography
