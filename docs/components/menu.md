# Menu

## Overview

Action menu built as a provide/inject compound. `Menu` owns open state and placement; nest `MenuTrigger` and `MenuContent`, then put `MenuItem` / `MenuSeparator` inside the content. Selecting an item closes the menu and restores focus to the trigger.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  Cluster,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Text,
} from 'kablui'

const lastAction = ref<string | null>(null)
</script>

<template>
  <Cluster gap="sm" class="items-center">
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem @select="lastAction = 'Edit'">Edit</MenuItem>
        <MenuItem @select="lastAction = 'Duplicate'">Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem disabled @select="lastAction = 'Archive'">Archive</MenuItem>
        <MenuItem @select="lastAction = 'Delete'">Delete</MenuItem>
      </MenuContent>
    </Menu>
    <Text size="sm" tone="muted">Last action: {{ lastAction ?? 'none' }}</Text>
  </Cluster>
</template>
```

### Nesting

```
Menu
├── MenuTrigger
└── MenuContent
    ├── MenuItem
    ├── MenuSeparator
    └── MenuItem
```

- `MenuTrigger` / `MenuContent` must be inside `Menu`.
- `MenuItem` / `MenuSeparator` must be inside `Menu` (typically under `MenuContent`); they warn if the menu context is missing.

Optional controlled open and placement:

```vue
<Menu v-model:open="open" placement="bottom-end">
  <MenuTrigger>More</MenuTrigger>
  <MenuContent><!-- items --></MenuContent>
</Menu>
```

## Props / Models / Emits / Slots

### Menu

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `FloatingPlacement` | `'bottom-start'` | Position relative to the trigger (`top` \| `bottom` \| `left` \| `right`, optionally with `-start` \| `-center` \| `-end`) |

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Open state (`v-model:open`) |

| Slot | Description |
| --- | --- |
| `default` | `MenuTrigger` and `MenuContent` |

### MenuTrigger

No props. Default slot is the trigger label.

Renders `<button type="button">` with `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`.

### MenuContent

No props. Default slot holds items/separators.

Teleports to `body` with `role="menu"` and `tabindex="-1"`.

### MenuItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Disables activation |

| Event | Payload | Description |
| --- | --- | --- |
| `select` | — | Fired when activated (click, `Enter`, or `Space`); menu then closes |

| Slot | Description |
| --- | --- |
| `default` | Item label |

Renders `role="menuitem"` with `tabindex="-1"` (menu manages focus).

### MenuSeparator

No props, no slots. Renders `role="separator"`.

## Accessibility

- Trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`.
- Content: `role="menu"`; items: `role="menuitem"`; separators: `role="separator"`.
- Opening (pointer or keyboard) focuses the first enabled item. Closing restores focus to the previously focused element or the trigger.
- Trigger keyboard: `ArrowDown`, `ArrowUp`, `Enter`, or `Space` open; when open, `Enter` / `Space` close, `ArrowDown` focuses first item, `ArrowUp` focuses last; `Escape` closes.
- Content keyboard: `ArrowDown` / `ArrowUp` move among enabled items; `Home` / `End` jump to edges. Item `Enter` / `Space` activates (`select` + close).
- Escape and outside click dismiss via the dismissable layer (`dropdown` stack).
- Disabled items use native `disabled` and `aria-disabled="true"` and are skipped by focus navigation.

## Related

- [Popover](/components/popover) — generic floating panel without menuitem semantics
- [Dialog](/components/dialog) — modal overlay
- [Button](/components/button) — standalone actions
