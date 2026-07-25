# Container

## Overview

`Container` centers content horizontally and constrains width with size presets and horizontal padding. Use it for page sections and readable content columns.

## Usage

```vue
<script setup lang="ts">
import { Container, Text } from 'kablui'
</script>

<template>
  <Container size="sm">
    <Text size="sm">size="sm" — centered, padded max-width</Text>
  </Container>
</template>
```

```vue
<script setup lang="ts">
import { Container } from 'kablui'
</script>

<template>
  <Container as="main" size="lg">
    <h1>Page title</h1>
    <p>Body copy stays within the large max-width.</p>
  </Container>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Max-width preset (`sm`/`md` use `px-4`; `lg` uses `px-6`) |
| `as` | `'div' \| 'section' \| 'article' \| 'main' \| 'aside' \| 'header' \| 'footer'` | `'div'` | Root element tag |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | Contained content |

## Accessibility

Layout-only. No ARIA roles or keyboard behavior are applied. Use `as="main"` or `as="section"` when the container is a landmark.

## Related

- [Stack](./stack.md)
- [Cluster](./cluster.md)
- [Getting started](../guides/getting-started.md)
