# Alert

## Overview

`Alert` shows an inline status message with an optional title and dismiss control. Use tones to communicate severity without interrupting the page flow (prefer [Toast](./toast.md) for transient notifications).

## Usage

```vue
<script setup lang="ts">
import { Alert, Stack } from 'kablui'
</script>

<template>
  <Stack gap="sm">
    <Alert tone="neutral" title="Neutral">Supporting copy for a status message.</Alert>
    <Alert tone="accent" title="Accent">Highlight something noteworthy.</Alert>
    <Alert tone="success" title="Success">Changes saved.</Alert>
    <Alert tone="warning" title="Warning">Review before continuing.</Alert>
    <Alert tone="danger" title="Danger">Something went wrong.</Alert>
  </Stack>
</template>
```

Dismissible alerts emit `dismiss` when the close control is activated; the parent decides visibility.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Alert, Button } from 'kablui'

const visible = ref(true)
</script>

<template>
  <Alert
    v-if="visible"
    tone="neutral"
    title="Dismissible"
    dismissible
    @dismiss="visible = false"
  >
    Click × to hide this alert.
  </Alert>
  <Button v-else size="sm" variant="outline" @click="visible = true">
    Show dismissible alert
  </Button>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'accent' \| 'danger' \| 'success' \| 'warning'` | `'neutral'` | Visual severity |
| `title` | `string` | — | Optional heading above the body |
| `dismissible` | `boolean` | `false` | Shows a dismiss control and emits `dismiss` when activated |

### Models

None.

### Emits

| Event | Payload | Description |
| --- | --- | --- |
| `dismiss` | — | Fired when the dismiss button is clicked (`dismissible` only) |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Alert body content |

## Accessibility

- Root uses `role="alert"` when `tone` is `danger`; otherwise `role="status"`.
- Dismiss control is a `<button type="button">` with `aria-label="Dismiss"`. The × glyph is `aria-hidden`.
- Focus-visible ring styles apply to the dismiss button.

## Related

- [Toast](./toast.md) — transient notifications
- [Empty](./empty.md) — empty-state messaging
- [Stack](./stack.md)
