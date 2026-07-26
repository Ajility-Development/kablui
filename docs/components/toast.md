# Toast

## Overview

Toasts are transient notifications. Mount **`ToastProvider`** near the app root, then call **`useToast()`** from descendants to show and dismiss toasts. The provider teleports a toast region to `body` (configurable) and renders individual `Toast` instances.

`Toast` is also exported if you need the presentational piece, but the supported consumer recipe is Provider + `useToast`.

## Usage

### 1. Wrap the app with `ToastProvider`

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ToastProvider } from 'kablui'
</script>

<template>
  <ToastProvider>
    <RouterView />
  </ToastProvider>
</template>
```

Optional provider props:

```vue
<script setup lang="ts">
import { ToastProvider } from 'kablui'
</script>

<template>
  <ToastProvider placement="top-end" :max-visible="3" to="body">
    <slot />
  </ToastProvider>
</template>
```

### 2. Call `useToast` under the provider

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, Cluster, useToast } from 'kablui'
import type { ToastTone } from 'kablui'

const { toast, dismiss } = useToast()
const stickyId = ref<string | null>(null)

function showToast(tone: ToastTone) {
  toast({
    tone,
    title:
      tone === 'success'
        ? 'Saved'
        : tone === 'danger'
          ? 'Failed'
          : tone === 'warning'
            ? 'Heads up'
            : tone === 'accent'
              ? 'Note'
              : 'Hello',
    description: 'Toast from useToast().',
  })
}

function showSticky() {
  if (stickyId.value) dismiss(stickyId.value)
  stickyId.value = toast({
    title: 'Sticky',
    description: 'Won’t auto-dismiss. Use Dismiss sticky or the × control.',
    duration: 0,
  })
}

function dismissSticky() {
  if (!stickyId.value) return
  dismiss(stickyId.value)
  stickyId.value = null
}

function showUndo() {
  const id = toast({
    tone: 'warning',
    title: 'Item deleted',
    description: 'Your change can be reverted.',
    action: {
      label: 'Undo',
      onClick: () => {
        dismiss(id)
        toast({ tone: 'success', title: 'Restored' })
      },
    },
  })
}
</script>

<template>
  <Cluster gap="sm">
    <Button size="sm" variant="outline" @click="showToast('neutral')">Neutral</Button>
    <Button size="sm" variant="outline" @click="showToast('accent')">Accent</Button>
    <Button size="sm" variant="outline" @click="showToast('success')">Success</Button>
    <Button size="sm" variant="outline" @click="showToast('warning')">Warning</Button>
    <Button size="sm" variant="outline" @click="showToast('danger')">Danger</Button>
    <Button size="sm" variant="outline" @click="showSticky">Sticky</Button>
    <Button size="sm" variant="outline" :disabled="!stickyId" @click="dismissSticky">
      Dismiss sticky
    </Button>
    <Button size="sm" variant="outline" @click="showUndo">Undo action</Button>
  </Cluster>
</template>
```

`useToast()` throws if called outside `ToastProvider`.

## Props / Models / Emits / Slots

### `ToastProvider` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `'bottom-end'` | Corner placement for the toast region |
| `maxVisible` | `number` | `3` | Max simultaneously visible toasts; excess wait in a queue |
| `to` | `string \| HTMLElement` | `'body'` | Teleport target |

### `ToastProvider` slots

| Slot | Description |
| --- | --- |
| `default` | App content that may call `useToast` |

### `useToast()` API

Returns `ToastContext`:

| Member | Type | Description |
| --- | --- | --- |
| `toast` | `(options: ToastOptions) => string` | Enqueues a toast; returns its `id` |
| `dismiss` | `(id: string) => void` | Removes a visible or pending toast by `id` |

### `ToastOptions`

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | _(required)_ | Toast title |
| `tone` | `'neutral' \| 'accent' \| 'danger' \| 'success' \| 'warning'` | `'neutral'` | Visual severity |
| `description` | `string` | — | Optional supporting text |
| `duration` | `number` | `5000` | Auto-dismiss ms. Use `0` for sticky |
| `action` | `{ label: string; onClick: () => void }` | — | Optional action button |

Exported types: `ToastOptions`, `ToastAction`, `ToastTone`, `ToastPlacement`, `ToastContext`, `ToastProviderProps`, `ToastProps`.

### `Toast` props (presentational)

Rendered by the provider; useful if composing manually.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `ToastTone` | `'neutral'` | Visual severity |
| `title` | `string` | _(required)_ | Title text |
| `description` | `string` | — | Supporting text |
| `action` | `{ label: string }` | — | Presentational action button; click emits `action` |

### `Toast` emits

| Event | Payload | Description |
| --- | --- | --- |
| `dismiss` | — | Dismiss control activated |
| `action` | — | Action control activated |

### `Toast` slots

None (title / description / action are props).

## Accessibility

From `Toast` / `ToastProvider` behavior:

- Each toast uses `role="alert"` when `tone` is `danger`; otherwise `role="status"`.
- Title and description are wired with `aria-labelledby` / `aria-describedby`.
- Dismiss control is a button with `aria-label="Dismiss"`; the × glyph is `aria-hidden`.
- Action (when present) is a focusable button with visible focus ring styles.
- The toast region is teleported and pointer-events are enabled on individual toasts.
- Toasts use the overlay stack z-index layer for toasts but **do not** register for Escape handling, so they do not steal Escape from dialogs.

## Related

- [Alert](./alert.md) — persistent inline status
- [Dialog](./dialog.md) — modal overlays
- [Cluster](./cluster.md)
- [Getting started](../guides/getting-started.md)
