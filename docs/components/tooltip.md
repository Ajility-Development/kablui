# Tooltip

## Overview

Short hint shown on hover or focus. Wrap a single interactive (or focusable) child; pass text via the `content` prop or the `content` slot. The tip teleports to `body` and is not dismissable as a modal—it hides when pointer/focus leave.

## Usage

```vue
<script setup lang="ts">
import { Button, Tooltip } from 'kablui'
</script>

<template>
  <Tooltip content="Helpful hint on hover or focus">
    <Button variant="outline">Hover or focus me</Button>
  </Tooltip>

  <!-- Rich content via slot -->
  <Tooltip placement="bottom" :delay="150">
    <Button variant="ghost">Details</Button>
    <template #content>Supports a content slot when you need markup.</template>
  </Tooltip>
</template>
```

Hover show/hide only runs when `(hover: hover)` matches; focus still shows the tip on devices without hover.

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `string` | — | Tooltip text when the `content` slot is unused |
| `placement` | `FloatingPlacement` | `'top'` | Position relative to the anchor (`top` \| `bottom` \| `left` \| `right`, optionally with `-start` \| `-center` \| `-end`) |
| `delay` | `number` | `300` | Milliseconds before showing on hover/focus |

### Models

None. Open state is internal (no `v-model:open`).

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | Anchor content (typically a focusable control) |
| `content` | Tooltip body; falls back to the `content` prop |

## Accessibility

- Floating node uses `role="tooltip"` and a generated id.
- While open, the first focusable descendant of the anchor (or the anchor itself) receives `aria-describedby` pointing at that id; the attribute is removed on hide.
- Shows after `delay` on `pointerenter` (hover-capable devices) and `focusin`; hides on `pointerleave` / `focusout` (when focus leaves the anchor).
- Tooltip content is `pointer-events: none` and is not interactive.

## Related

- [Popover](/components/popover) — interactive floating panel
- [Dialog](/components/dialog) — modal overlay
