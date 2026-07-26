# Stack

## Overview

`Stack` lays out children in a vertical flex column with consistent gap and cross-axis alignment. Use it for form groups, stacked text, or any simple vertical rhythm.

## Examples

### Basic

`gap` controls vertical spacing between children.

<Demo src="./demos/stack-basic.vue" />

Change the root element with `as` when semantics matter (for example `as="ul"` with list items as children). Use `align` for cross-axis alignment — see Props below.

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
