# Popover

## Overview

Compound floating panel for lightweight non-action content (details, filters, short forms). `Popover` provides open state and placement; nest `PopoverTrigger` and `PopoverContent` as children. Content teleports to `body` and dismisses on Escape or outside click.

**Popover is not for action menus.** Use [Menu](./menu.md) when the panel is a list of actions (edit, delete, share, etc.).

## Examples

### Basic

Nest `PopoverTrigger` and `PopoverContent` inside `Popover` for a lightweight details panel.

<Demo src="./demos/popover-basic.vue" />

### Controlled

Use `v-model:open` when an in-panel control should close the popover (filters, short forms). Do not use Popover for lists of actions—that is [Menu](./menu.md).

<Demo src="./demos/popover-controlled.vue" />

### Nesting

```
Popover
├── PopoverTrigger
└── PopoverContent
```

`PopoverTrigger` and `PopoverContent` must be used inside `Popover`. Outside that tree they warn in the console and do not function.

## Props / Models / Emits / Slots

### Popover

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `FloatingPlacement` | `'bottom-start'` | Position relative to the trigger (`top` \| `bottom` \| `left` \| `right`, optionally with `-start` \| `-center` \| `-end`) |

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Open state (`v-model:open`) |

| Slot | Description |
| --- | --- |
| `default` | Compound parts (`PopoverTrigger`, `PopoverContent`) |

### PopoverTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'outline'` | Button-aligned visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button-aligned size |

Default slot is the trigger label.

Renders a `<button type="button">` with `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` pointing at the content id.

### PopoverContent

No props. Default slot is the floating panel body.

Teleports to `body` with `role="dialog"` and `tabindex="-1"`. Placement comes from the parent `Popover`. Uses `z-kablui-menu` stacking.

## Accessibility

- Trigger exposes `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`.
- Content uses `role="dialog"` (not modal; no focus trap or scroll lock).
- Click toggles open. Keyboard: `Enter`, `Space`, or `ArrowDown` open (keyboard open focuses the content); `Enter` / `Space` also close when already open; `Escape` closes.
- Outside pointer and Escape dismiss via the dismissible layer (`menu` stack).
- On close, focus returns to the previously focused element or the trigger.

## Related

- [Menu](/components/menu) — action menu with menuitem keyboard model
- [Dialog](/components/dialog) — modal focus-trapped overlay
- [Tooltip](/components/tooltip) — non-interactive hint
