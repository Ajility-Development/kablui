# Empty

## Overview

`Empty` is a centered empty-state layout with optional icon, title, body, and action slots. Use it when a list, table, or search has no results.

## Usage

```vue
<script setup lang="ts">
import { Button, Empty, Icon } from 'kablui'

function onCreate() {
  // Optional: navigate, open a dialog, or show a toast.
}
</script>

<template>
  <Empty title="No results">
    <template #icon>
      <Icon size="lg" label="Empty inbox">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      </Icon>
    </template>
    Try a different filter or create something new.
    <template #action>
      <Button size="sm" variant="outline" @click="onCreate">Create item</Button>
    </template>
  </Empty>
</template>
```

Title-only or body-only variants work; each region renders only when provided.

```vue
<script setup lang="ts">
import { Empty } from 'kablui'
</script>

<template>
  <Empty title="Nothing here yet" />
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Optional heading |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `icon` | Optional leading icon or illustration |
| `default` | Supporting body copy |
| `action` | Optional CTA (for example a button) |

## Accessibility

No ARIA roles or live regions are applied by `Empty`. Provide accessible content in slots (for example an [Icon](./icon.md) with a `label`, or a clear `title` and body). Actions should be real focusable controls.

## Related

- [Alert](./alert.md) — inline status messages
- [Icon](./icon.md)
- [Button](./button.md)
- [Skeleton](./skeleton.md) — loading placeholders
