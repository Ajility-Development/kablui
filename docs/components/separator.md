# Separator

## Overview

Visual divider, horizontal by default. Decorative (`aria-hidden`) by default. Set `decorative` to `false` for a semantic separator with `role="separator"` and a stronger border.

## Usage

```vue
<script setup lang="ts">
import { Separator, Text } from 'kablui'
</script>

<template>
  <Text size="sm" tone="muted">Horizontal (default decorative)</Text>
  <Separator />

  <Text size="sm" tone="muted">Vertical + semantic</Text>
  <div class="flex h-8 items-center gap-3">
    <Text size="sm">Left</Text>
    <Separator orientation="vertical" :decorative="false" class="self-stretch" />
    <Text size="sm">Right</Text>
  </div>
</template>
```

For a vertical separator in a flex row, stretch height with a consumer class (e.g. `self-stretch`) as in the playground.

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Border axis (`border-t` vs `border-l`) |
| `decorative` | `boolean` | `true` | When true, decorative (`aria-hidden`); when false, `role="separator"` with stronger border |

### Models

None.

### Emits

None.

### Slots

None. Self-closing; no content slot.

## Accessibility

- Default (`decorative` true): no `role`, `aria-hidden="true"`.
- When `decorative` is false: `role="separator"`.
- When `decorative` is false and `orientation` is `'vertical'`: also sets `aria-orientation="vertical"`. Horizontal semantic separators do not set `aria-orientation`.
- Semantic separators (`decorative` false) use a stronger border token than decorative ones.

## Related

- [Stack](/components/stack) — vertical spacing without a rule
- [Cluster](/components/cluster) — horizontal grouping
- [Text](/components/text) — section labels beside dividers
