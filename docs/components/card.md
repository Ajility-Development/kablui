# Card

## Overview

Surface for grouping related content. Card is **slot-region composition only**—there is no provide/inject context. Nest `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` as ordinary children for consistent padding and structure. Regions own their padding; `Card` itself has no `padding` prop.

## Examples

### Regions

`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` nest as ordinary children for consistent padding and structure.

<Demo src="./demos/card-regions.vue" />

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
