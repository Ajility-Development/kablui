# Dialog

## Overview

Modal dialog teleported to the document body. Use it for confirmations and short focused tasks that need focus trapping, scroll lock, and dismiss via Escape, backdrop, or an optional close button.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dialog, Text } from 'kablui'

const open = ref(false)
</script>

<template>
  <Button variant="solid" @click="open = true">Open dialog</Button>

  <Dialog v-model:open="open" show-close>
    <template #title>Confirm action</template>
    <template #description>
      Escape, backdrop click, or the close button dismisses this dialog.
    </template>
    <Text size="sm">Focus stays trapped while open; body scroll is locked.</Text>
    <template #footer>
      <Button variant="ghost" @click="open = false">Cancel</Button>
      <Button variant="solid" @click="open = false">Confirm</Button>
    </template>
  </Dialog>
</template>
```

Set `dismissible` to `false` when Escape and backdrop click should not close the dialog (the close button still works when `showClose` is set).

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dismissible` | `boolean` | `true` | Dismiss on Escape and backdrop click |
| `showClose` | `boolean` | `false` | Show a close button in the header (`aria-label="Close"`) |
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
- Optional close control is a native button with `aria-label="Close"`.

## Related

- [Popover](/components/popover) — non-modal floating panel
- [Tooltip](/components/tooltip) — hover/focus hint
- [Toast](/components/toast) — non-blocking notifications
