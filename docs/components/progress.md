# Progress

## Overview

`Progress` renders a progress bar for determinate completion or an indeterminate “working” state. Omit `value` (or set `indeterminate`) for indeterminate mode.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, Progress, Stack } from 'kablui'

const progress = ref(42)
</script>

<template>
  <Stack gap="sm" class="max-w-md">
    <Progress :value="progress" :label="`${progress}% complete`" />
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" @click="progress = Math.max(0, progress - 10)">
        −10
      </Button>
      <Button size="sm" variant="outline" @click="progress = Math.min(100, progress + 10)">
        +10
      </Button>
    </div>
    <Progress indeterminate label="Working…" />
  </Stack>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | Current value. Omit (or set `indeterminate`) for an indeterminate bar |
| `max` | `number` | `100` | Maximum value; values are clamped to `[0, max]` |
| `indeterminate` | `boolean` | `false` | Force indeterminate mode even when `value` is set |
| `label` | `string` | — | Visible label above the bar and accessible name for the progressbar |

### Models

None.

### Emits

None.

### Slots

None.

## Accessibility

- The track has `role="progressbar"`, `aria-valuemin="0"`, and `aria-valuemax` from `max`.
- Determinate: `aria-valuenow` is the clamped value.
- Indeterminate (`indeterminate` or omitted `value`): `aria-valuenow` is omitted and `aria-busy="true"`.
- When `label` is set, it is shown visually and applied as `aria-label` on the progressbar.

## Related

- [Spinner](./spinner.md) — compact loading indicator
- [Skeleton](./skeleton.md) — content placeholders
- [Alert](./alert.md)
