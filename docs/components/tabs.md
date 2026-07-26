# Tabs

## Overview

Tabbed panels for switching views in place. `Tabs` holds the selected value via `v-model`; nest a `TabList` of `Tab`s and sibling `TabPanel`s. Parts inject from `Tabs` and warn if used outside that tree.

## Examples

### Basic

Nest a `TabList` of `Tab`s with sibling `TabPanel`s. A panel whose matching tab is `disabled` stays unreachable.

<Demo src="./demos/tabs-basic.vue" />

Keep the panel in the tree if you will enable the tab later; omit it if the view should not exist.

### Vertical

`orientation="vertical"` stacks the tab list and changes arrow-key direction to up/down.

<Demo src="./demos/tabs-vertical.vue" />

### Nesting

```
Tabs
├── TabList
│   └── Tab (value, optional disabled)
└── TabPanel (value)   ← sibling of TabList, same Tabs root
```

- `TabList`, `Tab`, and `TabPanel` must be used inside `Tabs`.
- Match each panel’s `value` to a tab’s `value`.

## Props / Models / Emits / Slots

### Tabs

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout and arrow-key direction for the tab list |

| Model | Type | Description |
| --- | --- | --- |
| `modelValue` (`v-model`) | `string` | Selected tab value |

| Slot | Description |
| --- | --- |
| `default` | `TabList` and `TabPanel` children |

Root sets `data-orientation` and flex direction from `orientation`.

### TabList

No props. Default slot holds `Tab` children.

Renders `role="tablist"` with `aria-orientation` from the parent `Tabs`.

### Tab

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Tab id; must match a `TabPanel` |
| `disabled` | `boolean` | `false` | Disables selection |

| Slot | Description |
| --- | --- |
| `default` | Tab label |

Renders `role="tab"` with `aria-selected`, `aria-controls` (panel id), and roving `tabindex` (`0` on the selected/tabbable tab, `-1` otherwise).

### TabPanel

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string` | Panel id matching a `Tab` |

| Slot | Description |
| --- | --- |
| `default` | Panel content |

Renders `role="tabpanel"` with `aria-labelledby` (tab id). Hidden when not selected (`hidden` attribute); selected panels are focusable (`tabindex="0"`).

### Emits

None beyond the Tabs `v-model` update.

## Accessibility

- Tab list: `role="tablist"` + `aria-orientation`.
- Tabs: `role="tab"`, `aria-selected`, `aria-controls`; panels: `role="tabpanel"`, `aria-labelledby`.
- Roving tabindex: only the selected (or first enabled when none selected) tab is in the tab order.
- Keyboard on a tab: `ArrowRight` / `ArrowLeft` (horizontal) or `ArrowDown` / `ArrowUp` (vertical) move selection and focus among enabled tabs; `Home` / `End` jump to first/last enabled. Selection updates as focus moves.
- Disabled tabs are skipped and cannot be selected; their panels are unreachable while disabled.

## Related

- [Accordion](/components/accordion) — stacked expandable sections
- [Menu](/components/menu) — action menu, not in-page panels
