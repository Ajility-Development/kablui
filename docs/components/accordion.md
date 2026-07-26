# Accordion

## Overview

Expandable sections for FAQs and settings groups. `Accordion` provides open state via `v-model`; each `AccordionItem` owns a value and nests `AccordionTrigger` + `AccordionContent`. Parts warn if used outside the correct parent.

The `type` prop is tied to the `v-model` shape: `single` uses `string | undefined`; `multiple` uses `string[]`.

## Examples

### Single (collapsible)

`type="single"` opens one item at a time. Set `collapsible` (default `true`) to allow collapsing the open item. Disabled items do not toggle.

<Demo src="./demos/accordion-single.vue" />

### Multiple

`type="multiple"` keeps an array of open values. Override the trigger heading with `heading` when the outline needs a different level.

<Demo src="./demos/accordion-multiple.vue" />

### Nesting

```
Accordion
└── AccordionItem (value, optional disabled)
    ├── AccordionTrigger
    └── AccordionContent
```

- `AccordionItem` must be inside `Accordion`.
- `AccordionTrigger` and `AccordionContent` must be inside `AccordionItem`.

## Props / Models / Emits / Slots

### Accordion

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'single' \| 'multiple'` | `'single'` | One open item vs many; ties `v-model` shape |
| `collapsible` | `boolean` | `true` | When `type="single"`, allow collapsing the open item |

| Model | Type | Description |
| --- | --- | --- |
| `modelValue` (`v-model`) | `string \| undefined` (single) or `string[]` (multiple) | Open value(s) |

| Slot | Description |
| --- | --- |
| `default` | `AccordionItem` children |

### AccordionItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Stable id used with Accordion `v-model` (reactive) |
| `disabled` | `boolean` | `false` | Disables the item trigger |

| Slot | Description |
| --- | --- |
| `default` | `AccordionTrigger` and `AccordionContent` |

Sets `data-state="open" \| "closed"` and `data-disabled` when disabled.

### AccordionTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `heading` | `'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'h3'` | Heading element wrapping the button |

Default slot is the trigger label. Renders a chevron that rotates when open.

Renders `<{heading}><button type="button">…</button></{heading}>` with `aria-expanded` and `aria-controls` linked to the item content.

### AccordionContent

No props. Default slot is the panel body.

Renders a `role="region"` panel with `aria-labelledby` pointing at the trigger; visibility toggles with `v-show` when the item is open. Padding and foreground match `TabPanel` (`px-1 py-3 text-kablui-fg`).

### Emits

None beyond the Accordion `v-model` update.

## Accessibility

- Trigger is a native button with `aria-expanded` and `aria-controls`; content is a `role="region"` labelled by the trigger.
- Keyboard on the trigger: `Enter` / `Space` toggle; `ArrowDown` / `ArrowUp` move focus among enabled triggers (wraps).
- Disabled items do not toggle and are skipped for arrow focus.
- Heading wrapper defaults to `<h3>`; override with `heading` (`h2`–`h6`).

## Related

- [Tabs](/components/tabs) — mutually exclusive panels in a tablist
- [Card](/components/card) — static content grouping
