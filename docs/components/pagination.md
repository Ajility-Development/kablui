# Pagination

## Overview

Navigation control for paged lists. Bind the current page with `v-model:page` and pass `pageCount`. Renders Previous / Next plus numbered page buttons with ellipsis when the range is large.

## Examples

### Controlled page

Bind the current page with `v-model:page` and pass `pageCount`. `siblingCount` controls how many page numbers appear on each side of the current page before ellipsis appear (default `1`).

<Demo src="./demos/pagination-controlled.vue" />

### Disabled

Set `disabled` to disable Previous, Next, and all page buttons.

<Demo src="./demos/pagination-disabled.vue" />

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pageCount` | `number` | — | Total number of pages (required) |
| `siblingCount` | `number` | `1` | Page numbers shown on each side of the current page |
| `disabled` | `boolean` | `false` | Disables all controls |
| `label` | `string` | `'Pagination'` | Accessible name for the `<nav>` (`aria-label`) |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `number` | `1` | Current page (`v-model:page`), 1-based. Pagination clamps `page` into `[1, pageCount]` when `pageCount >= 1`. |

### Emits

None beyond the `page` model update.

### Slots

None. Labels for Previous / Next and page numbers are built in.

## Accessibility

- Root is `<nav>` with `aria-label` from `label` (default `"Pagination"`); when disabled, `aria-disabled` is set on the nav.
- Previous / Next buttons use `aria-label="Previous page"` / `"Next page"` and are disabled at the ends (or when the whole control is disabled).
- Page buttons use `aria-label="Page N"`; the current page has `aria-current="page"` and a solid button variant.
- Ellipsis markers are `aria-hidden="true"`.

## Related

- [Button](/components/button) — underlying control styling
- [Cluster](/components/cluster) — layout helpers around pagination
