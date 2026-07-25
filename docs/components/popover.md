# Popover

## Overview

Compound floating panel for lightweight dropdown-style UI. `Popover` provides open state and placement; nest `PopoverTrigger` and `PopoverContent` as children. Content teleports to `body` and dismisses on Escape or outside click.

## Usage

```vue
<script setup lang="ts">
import { Button, Popover, PopoverContent, PopoverTrigger, Stack } from 'kablui'
</script>

<template>
  <Popover>
    <PopoverTrigger>Actions</PopoverTrigger>
    <PopoverContent>
      <Stack gap="sm" as="ul" class="m-0 min-w-40 list-none p-0">
        <li>
          <Button variant="ghost" size="sm" class="w-full justify-start">Edit</Button>
        </li>
        <li>
          <Button variant="ghost" size="sm" class="w-full justify-start">Duplicate</Button>
        </li>
        <li>
          <Button variant="ghost" size="sm" class="w-full justify-start">Archive</Button>
        </li>
      </Stack>
    </PopoverContent>
  </Popover>
</template>
```

### Nesting

```
Popover
├── PopoverTrigger
└── PopoverContent
```

`PopoverTrigger` and `PopoverContent` must be used inside `Popover`. Outside that tree they warn in the console and do not function.

Optional controlled open:

```vue
<Popover v-model:open="open" placement="bottom-end">
  <PopoverTrigger>More</PopoverTrigger>
  <PopoverContent><!-- … --></PopoverContent>
</Popover>
```

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

No props. Default slot is the trigger label.

Renders a `<button type="button">` with `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` pointing at the content id.

### PopoverContent

No props. Default slot is the floating panel body.

Teleports to `body` with `role="dialog"` and `tabindex="-1"`. Placement comes from the parent `Popover`.

## Accessibility

- Trigger exposes `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`.
- Content uses `role="dialog"` (not modal; no focus trap or scroll lock).
- Click toggles open. Keyboard: `Enter`, `Space`, or `ArrowDown` open (keyboard open focuses the content); `Enter` / `Space` also close when already open; `Escape` closes.
- Outside pointer and Escape dismiss via the overlay dismissable layer (`dropdown` stack).
- On close, focus returns to the previously focused element or the trigger.

## Related

- [Menu](/components/menu) — action menu with menuitem keyboard model
- [Dialog](/components/dialog) — modal focus-trapped overlay
- [Tooltip](/components/tooltip) — non-interactive hint
