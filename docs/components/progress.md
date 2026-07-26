# Progress

## Overview

`Progress` renders a progress bar for determinate completion or an indeterminate “working” state. Omit `value` (or set `indeterminate`) for indeterminate mode. Use `caption` for visible copy above the bar; use `label` for an accessible name that is not shown.

## Examples

### Value

Pass `value` for a determinate bar. `caption` is visible above the track.

<Demo src="./demos/progress-value.vue" />

### Indeterminate

Set `indeterminate` (or omit `value`) for a working state. Prefer `label` when the caption alone is not enough for assistive tech.

<Demo src="./demos/progress-indeterminate.vue" />

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | Current value. Omit (or set `indeterminate`) for an indeterminate bar |
| `max` | `number` | `100` | Maximum value; values are clamped to `[0, max]` |
| `indeterminate` | `boolean` | `false` | Force indeterminate mode even when `value` is set |
| `caption` | `string` | — | Visible text above the bar; also used for `aria-label` when `label` is omitted |
| `label` | `string` | — | Accessible name for the progressbar only (not shown) |

### Models

None.

### Emits

None.

### Slots

None.

## Accessibility

- The track has `role="progressbar"`, `aria-valuemin="0"`, and `aria-valuemax` from `max`.
- Determinate: `aria-valuenow` is the clamped value.
- Indeterminate (`indeterminate` or omitted `value`): `aria-valuenow` is omitted and `aria-busy="true"`.
- `aria-label` is `label` when set, otherwise `caption`.
- Indeterminate fill uses a short translate/slide shimmer (not a skeleton pulse).

## Related

- [Spinner](./spinner.md) — compact loading indicator
- [Skeleton](./skeleton.md) — content placeholders
- [Alert](./alert.md)
