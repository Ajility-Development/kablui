# Icon

## Overview

Sized wrapper for a slotted SVG (no icon package). Decorative by default; pass `label` when the icon conveys meaning on its own.

## Usage

```vue
<script setup lang="ts">
import { Icon, Text } from 'kablui'
</script>

<template>
  <!-- Meaningful: label sets role="img" + aria-label -->
  <Icon size="sm" label="Check small">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 13l4 4L19 7" />
    </svg>
  </Icon>
  <Icon size="md" label="Check medium">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 13l4 4L19 7" />
    </svg>
  </Icon>
  <Icon size="lg" label="Check large">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 13l4 4L19 7" />
    </svg>
  </Icon>

  <!-- title is a native tooltip only; icon stays decorative without label -->
  <Icon size="md" title="Accent currentColor">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l2.5 2.5" />
    </svg>
  </Icon>

  <!-- Decorative (no label) -->
  <Icon size="md">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  </Icon>
</template>
```

Color follows `currentColor` from the parent. Pair with [Button](/components/button) for icon-only actions and put the accessible name on the button, not the decorative icon.

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Box size (`size-3` / `size-4` / `size-5`) |
| `label` | `string` | — | Accessible name; when set, exits decorative mode (`role="img"` + `aria-label`) |
| `title` | `string` | — | Native `title` tooltip only; does not change decorative vs. meaningful mode |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | SVG (or other graphic) content; sized to fill the wrapper |

## Accessibility

- Without `label`, the wrapper is decorative: `aria-hidden="true"` and no `role`.
- With `label`, sets `role="img"` and `aria-label` to that value.
- `title` alone does not exit decorative mode; use `label` for screen-reader naming.

## Related

- [Button](/components/button) — common host for icons
- [Text](/components/text) — accompanying labels
