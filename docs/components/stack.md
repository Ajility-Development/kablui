# Stack

## Overview

`Stack` lays out children in a vertical flex column with consistent gap and cross-axis alignment. Use it for form groups, stacked text, or any simple vertical rhythm.

## Usage

```vue
<script setup lang="ts">
import { Stack, Text } from 'kablui'
</script>

<template>
  <Stack gap="sm">
    <Text size="sm">Item one</Text>
    <Text size="sm">Item two</Text>
    <Text size="sm">Item three</Text>
  </Stack>
</template>
```

Change the root element with `as` when semantics matter (for example `as="ul"` with list items as children).

```vue
<script setup lang="ts">
import { Stack } from 'kablui'
</script>

<template>
  <Stack as="section" gap="lg" align="center">
    <p>Centered column</p>
  </Stack>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `gap` | `'sm' \| 'md' \| 'lg'` | `'md'` | Vertical spacing between children |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `'stretch'` | Cross-axis alignment (`align-items`) |
| `as` | `'div' \| 'section' \| 'article' \| 'main' \| 'aside' \| 'nav' \| 'ul' \| 'ol' \| 'form' \| 'header' \| 'footer'` | `'div'` | Root element tag |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | Stacked children |

## Accessibility

Layout-only. No ARIA roles or keyboard behavior are applied. Choose a meaningful `as` when the stack represents a landmark or list.

## Related

- [Cluster](./cluster.md) — wrapping horizontal layout
- [Container](./container.md) — max-width page width
- [Getting started](../guides/getting-started.md)
