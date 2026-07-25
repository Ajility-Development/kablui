# Badge

## Overview

Compact status chip for short labels. Supports neutral, accent, and danger tones, plus small and medium sizes.

## Usage

```vue
<script setup lang="ts">
import { Badge } from 'kablui'
</script>

<template>
  <Badge tone="neutral">Neutral</Badge>
  <Badge tone="accent">Accent</Badge>
  <Badge tone="danger">Danger</Badge>
  <Badge size="sm" tone="accent">sm accent</Badge>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'accent' \| 'danger'` | `'neutral'` | Color treatment |
| `size` | `'sm' \| 'md'` | `'md'` | Padding and text size |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | Badge label |

## Accessibility

- Renders a `<span>` with no ARIA attributes.
- Convey status in the visible text (or pair with nearby labeled content); the component does not expose a role or live region.

## Related

- [Text](/components/text) — longer copy
- [Alert](/components/alert) — prominent inline messages
