# Button

## Overview

Native `<button>` for actions and CTAs. Supports solid, outline, and ghost variants; three sizes; and a disabled state that blocks clicks.

## Usage

```vue
<script setup lang="ts">
import { Button, Icon } from 'kablui'
</script>

<template>
  <Button variant="solid" @click="() => {}">Solid</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button size="sm">sm</Button>
  <Button size="lg">lg</Button>
  <Button disabled>Disabled</Button>

  <Button variant="outline">
    <Icon size="sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Icon>
    With icon
  </Button>

  <!-- Icon-only: provide an accessible name on the button -->
  <Button variant="ghost" aria-label="More options">
    <Icon size="sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </Icon>
  </Button>
</template>
```

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding and text size |
| `disabled` | `boolean` | `false` | Disables the button and ignores clicks |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button `type` |

### Models

None.

### Emits

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `MouseEvent` | Fired on click when not disabled |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Button content (label, icons, etc.) |

## Accessibility

- Renders a native `<button>` with `type` and `disabled` wired through.
- When `disabled`, the click handler returns early and does not emit `click`.
- Focus styling uses `focus-visible` ring utilities on the button.
- Icon-only usage should set an accessible name on the button (e.g. `aria-label`); the component does not add one automatically.

## Related

- [Icon](/components/icon) — slotted SVG for buttons
- [Link](/components/link) — navigation instead of actions
- [Text](/components/text) — typography
