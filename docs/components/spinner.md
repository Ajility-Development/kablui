# Spinner

## Overview

`Spinner` is a compact loading indicator. Pass `label` so assistive technology announces the busy state; the label is visually hidden.

## Usage

```vue
<script setup lang="ts">
import { Spinner } from 'kablui'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <Spinner size="sm" label="Loading small" />
    <Spinner size="md" label="Loading" />
    <Spinner size="lg" label="Loading large" />
  </div>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size |
| `label` | `string` | — | Accessible name — rendered visually hidden for assistive tech |

### Models

None.

### Emits

None.

### Slots

None.

## Accessibility

- Root has `role="status"`.
- When `label` is set: `aria-busy="true"`, `aria-label` matches `label`, and an `sr-only` text node duplicates the label.
- The spinning graphic is `aria-hidden="true"`.
- Without `label`, no `aria-busy` or `aria-label` is set — provide a label for meaningful loading states.

## Related

- [Progress](./progress.md) — determinate / indeterminate progress bar
- [Skeleton](./skeleton.md) — content placeholders
- [Empty](./empty.md)
