# Toast

## Overview

Toasts are transient notifications. Mount **`ToastProvider`** near the app root, then call **`useToast()`** from descendants to show and dismiss toasts. The provider teleports a toast region to `body` (configurable) and renders individual `Toast` instances.

`Toast` is also exported if you need the presentational piece, but the supported consumer recipe is Provider + `useToast`.

## Usage

### 1. Wrap the app with `ToastProvider`

Docs already wrap the app with `ToastProvider`, so live demos below need no per-page provider. In your app, mount it near the root:

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

## Examples

### Variants

Call `useToast()` under a provider and pass a `tone` for each notification.

<Demo src="./demos/toast-variants.vue" />

### Sticky

Set `duration: 0` to keep a toast until dismissed via `dismiss(id)` or the × control.

<Demo src="./demos/toast-sticky.vue" />

### Action

Pass an `action` with `label` and `onClick` (for example, Undo).

<Demo src="./demos/toast-action.vue" />

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
