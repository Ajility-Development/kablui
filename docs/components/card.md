# Card

## Overview

Surface for grouping related content. Card is **slot-region composition only**—there is no provide/inject context. Nest `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` as ordinary children for consistent padding and structure. Regions own their padding; `Card` itself has no `padding` prop.

## Usage

```vue
<script setup lang="ts">
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'kablui'

function onCancel() {
  // Optional: close a drawer, reset form state, etc.
}

function onUpgrade() {
  // Optional: start checkout or open a confirm dialog.
}
</script>

<template>
  <Card as="article" class="max-w-md">
    <CardHeader>
      <CardTitle>Team plan</CardTitle>
      <CardDescription>Shared workspace for up to 10 people.</CardDescription>
    </CardHeader>
    <CardContent>
      Includes projects, comments, and role-based access.
    </CardContent>
    <CardFooter>
      <Button variant="ghost" @click="onCancel">Cancel</Button>
      <Button @click="onUpgrade">Upgrade</Button>
    </CardFooter>
  </Card>
</template>
```

### Regions

```
Card
├── CardHeader
│   ├── CardTitle
│   └── CardDescription
├── CardContent
└── CardFooter
```

Parts are independent styled wrappers. You can omit regions or use `Card` alone with custom children. Prefer the region components when you want the built-in header/content/footer spacing.

## Props / Models / Emits / Slots

### Card

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `'div' \| 'article' \| 'section'` | `'div'` | Root element |

| Slot | Description |
| --- | --- |
| `default` | Card contents (typically region components) |

### CardHeader / CardContent / CardFooter / CardDescription

No props. Default slot only.

| Part | Element | Role |
| --- | --- | --- |
| `CardHeader` | `div` | Top cluster (title + description) |
| `CardContent` | `div` | Main content |
| `CardFooter` | `div` | Actions row with top border |
| `CardDescription` | `p` | Muted supporting text |

### CardTitle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'h3'` | Heading element |

| Slot | Description |
| --- | --- |
| `default` | Title text |

### Models / Emits

None on Card or its regions.

## Accessibility

- No ARIA roles are applied by Card regions; choose `as` on `Card` / `CardTitle` to match document outline (`article` + heading level).
- `CardDescription` renders a `<p>`; keep descriptive copy there rather than in the title.

## Related

- [Stack](/components/stack) / [Cluster](/components/cluster) — layout inside content/footer
- [Button](/components/button) — footer actions
- [Text](/components/text) — text outside Card regions
