# Skeleton

## Overview

`Skeleton` is a decorative placeholder for loading content. Use rectangles and circles to mirror the eventual layout while data loads.

## Examples

### Shapes

Combine `circle` and rectangular skeletons to mirror an avatar-plus-lines layout. Set `width` / `height` as CSS lengths.

<Demo src="./demos/skeleton-shapes.vue" />

Set `:animated="false"` when a static placeholder is enough — see Props below.

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `string` | `100%` (rect) / `2.5rem` (circle) | CSS width (e.g. `8rem` or `100%`) |
| `height` | `string` | `1rem` (rect) / `2.5rem` (circle) | CSS height (e.g. `1rem`) |
| `circle` | `boolean` | `false` | Render as a circle (uses `height`/`width` for diameter) |
| `animated` | `boolean` | `true` | Pulse animation |

Defaults for `width` / `height` apply in the template when those props are omitted; they are not `withDefaults` entries on the props object.

### Models

None.

### Emits

None.

### Slots

None.

## Accessibility

- Root has `aria-hidden="true"` so placeholders are ignored by assistive technology.
- Pair skeletons with a nearby loading announcement (for example [Spinner](./spinner.md) with a `label`, or live-region copy in your app) when users need status feedback.

## Related

- [Spinner](./spinner.md)
- [Progress](./progress.md)
- [Empty](./empty.md)
- [Stack](./stack.md)
