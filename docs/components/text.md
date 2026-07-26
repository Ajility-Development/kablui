# Text

## Overview

Polymorphic text primitive. Renders as a paragraph by default, or as another element via `as`, with size, weight, and tone tokens.

## Examples

### Sizes, weights, and tones

Use `as` for element type, then `size`, `weight`, and `tone` for typography tokens.

<Demo src="./demos/text-tones.vue" />

## Props / Models / Emits / Slots

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `'p' \| 'span' \| 'div' \| 'label' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'p'` | Element to render |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Font size token |
| `weight` | `'normal' \| 'medium' \| 'semibold'` | `'normal'` | Font weight token |
| `tone` | `'default' \| 'muted' \| 'accent' \| 'danger'` | `'default'` | Color tone |

### Models

None.

### Emits

None.

### Slots

| Slot | Description |
| --- | --- |
| `default` | Text content |

## Accessibility

- No ARIA attributes are set by the component.
- Choose `as` to match document structure (e.g. headings vs. body vs. inline `span`).

## Related

- [Button](/components/button) — actions
- [Link](/components/link) — navigational text
- [Badge](/components/badge) — short status labels
