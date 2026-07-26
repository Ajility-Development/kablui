# Badge

## Overview

Compact status label for short text. Supports the full status tone set (neutral, accent, danger, success, warning) and small, medium, and large sizes.

## Usage

```vue
<script setup lang="ts">
import { Badge } from 'kablui'
</script>

<template>
  <Badge tone="neutral">Neutral</Badge>
  <Badge tone="accent">Accent</Badge>
  <Badge tone="danger">Danger</Badge>
  <Badge tone="success">Success</Badge>
  <Badge tone="warning">Warning</Badge>
  <Badge size="sm" tone="accent">sm accent</Badge>
  <Badge size="lg" tone="accent">lg accent</Badge>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'accent' \| 'danger' \| 'success' \| 'warning'` | `'neutral'` | Color treatment |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding and text size |

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
