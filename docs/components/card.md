# Card

## Overview

Surface for grouping related content. Card is **slot-region composition only**—there is no provide/inject context. Nest `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, and `CardFooter` as ordinary children for consistent padding and structure.

## Usage

```vue
<script setup lang="ts">
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'kablui'
</script>

<template>
  <Card as="article" class="max-w-md">
    <CardHeader>
      <CardTitle>Team plan</CardTitle>
      <CardDescription>Shared workspace for up to 10 people.</CardDescription>
    </CardHeader>
    <CardBody>
      Includes projects, comments, and role-based access.
    </CardBody>
    <CardFooter>
      <Button variant="ghost">Cancel</Button>
      <Button>Upgrade</Button>
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
├── CardBody
└── CardFooter
```

Parts are independent styled wrappers. You can omit regions or use `Card` alone with custom children. Prefer the region components when you want the built-in header/body/footer spacing.

With `padding="sm"` or `padding="md"` on `Card`, apply padding on the root instead of (or in addition to) region padding—regions always keep their own horizontal/vertical spacing.

## Props / Models / Emits / Slots

### Card

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `'div' \| 'article' \| 'section'` | `'div'` | Root element |
| `padding` | `'none' \| 'sm' \| 'md'` | `'none'` | Root padding (`sm` → `p-3`, `md` → `p-4`) |

| Slot | Description |
| --- | --- |
| `default` | Card contents (typically region components) |

### CardHeader / CardBody / CardFooter / CardDescription

No props. Default slot only.

| Part | Element | Role |
| --- | --- | --- |
| `CardHeader` | `div` | Top cluster (title + description) |
| `CardBody` | `div` | Main content |
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

- [Stack](/components/stack) / [Cluster](/components/cluster) — layout inside body/footer
- [Button](/components/button) — footer actions
- [Text](/components/text) — typography outside Card regions
