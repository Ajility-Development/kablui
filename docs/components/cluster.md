# Cluster

## Overview

`Cluster` lays out children in a wrapping horizontal flex row with gap, alignment, and justify controls. Use it for badge groups, button toolbars, and other wrap-friendly collections.

## Usage

```vue
<script setup lang="ts">
import { Badge, Cluster } from 'kablui'
</script>

<template>
  <Cluster gap="sm">
    <Badge
      v-for="n in 8"
      :key="n"
      size="sm"
      tone="neutral"
    >
      Item {{ n }}
    </Badge>
  </Cluster>
</template>
```

```vue
<script setup lang="ts">
import { Button, Cluster } from 'kablui'
</script>

<template>
  <Cluster gap="sm" justify="between" align="center">
    <Button size="sm" variant="outline">Cancel</Button>
    <Button size="sm">Save</Button>
  </Cluster>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `gap` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spacing between children |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `'center'` | Cross-axis alignment (`align-items`) |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `'start'` | Main-axis distribution (`justify-content`) |
| `as` | `'div' \| 'section' \| 'article' \| 'main' \| 'aside' \| 'nav' \| 'ul' \| 'ol' \| 'form' \| 'header' \| 'footer'` | `'div'` | Root element tag |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | Cluster children |

## Accessibility

Layout-only. No ARIA roles or keyboard behavior are applied. Prefer `as="ul"` / `as="ol"` when the cluster is a list of items.

## Related

- [Stack](./stack.md) — vertical layout
- [Container](./container.md) — max-width page width
- [Button](./button.md)
- [Badge](./badge.md)
