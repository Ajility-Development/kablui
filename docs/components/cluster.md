# Cluster

## Overview

`Cluster` lays out children in a wrapping horizontal flex row with gap, alignment, and justify controls. Use it for badge groups, button toolbars, and other wrap-friendly collections.

## Examples

### Basic

Children wrap with consistent `gap`. Tone and size on the badges are independent of the cluster.

<Demo src="./demos/cluster-basic.vue" />

Use `justify` and `align` for toolbars (for example `justify="between"` with Cancel / Save buttons) — see Props below.

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
