# Container

## Overview

`Container` centers content horizontally and constrains width with size presets and horizontal padding. Use it for page sections and readable content columns.

## Examples

### Basic

`size` sets the max-width preset. The dashed border below is demo chrome so you can see centering against a wider parent.

<Demo src="./demos/container-basic.vue" />

Use `as` for landmarks (for example `as="main"`) — see Props below.

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
