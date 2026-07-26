# Text

## Overview

Polymorphic text primitive. Renders as a paragraph by default, or as another element via `as`, with size, weight, and tone tokens.

## Usage

```vue
<script setup lang="ts">
import { Text } from 'kablui'
</script>

<template>
  <Text as="h4" size="lg" weight="semibold">Heading via as="h4"</Text>
  <Text size="sm" tone="muted">Small muted supporting copy.</Text>
  <Text size="md" weight="medium" tone="accent">Medium accent label</Text>
  <Text as="span" size="sm" tone="danger">Inline danger span</Text>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `'p' \| 'span' \| 'div' \| 'label' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'p'` | Element to render |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Font size token |
| `weight` | `'normal' \| 'medium' \| 'semibold'` | `'normal'` | Font weight token |
| `tone` | `'default' \| 'muted' \| 'accent' \| 'danger'` | `'default'` | Color tone |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | Text content |

## Accessibility

- No ARIA attributes are set by the component.
- Choose `as` to match document structure (e.g. headings vs. body vs. inline `span`).

## Related

- [Button](/components/button) — actions
- [Link](/components/link) — navigational text
- [Badge](/components/badge) — short status labels
