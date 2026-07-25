# Accordion

## Overview

Expandable sections for FAQs and settings groups. `Accordion` provides open state via `v-model`; each `AccordionItem` owns a value and nests `AccordionTrigger` + `AccordionContent`. Parts warn if used outside the correct parent.

## Usage

### Single (collapsible)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'kablui'

const open = ref<string | undefined>('billing')
</script>

<template>
  <Accordion v-model="open" type="single" class="max-w-md">
    <AccordionItem value="billing">
      <AccordionTrigger>Billing</AccordionTrigger>
      <AccordionContent>
        Invoices, payment methods, and plan changes.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="security">
      <AccordionTrigger>Security</AccordionTrigger>
      <AccordionContent>
        Password, two-factor authentication, and sessions.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="disabled" disabled>
      <AccordionTrigger>Disabled</AccordionTrigger>
      <AccordionContent>You should not see this.</AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
```

### Multiple

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'kablui'

const open = ref<string[]>(['shipping'])
</script>

<template>
  <Accordion v-model="open" type="multiple" class="max-w-md">
    <AccordionItem value="shipping">
      <AccordionTrigger>Shipping</AccordionTrigger>
      <AccordionContent>Addresses and delivery preferences.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="notifications">
      <AccordionTrigger>Notifications</AccordionTrigger>
      <AccordionContent>Email and in-app alert settings.</AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
```

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
| `type` | `'single' \| 'multiple'` | `'single'` | One open item vs many |
| `collapsible` | `boolean` | `true` | When `type="single"`, allow collapsing the open item |

| Model | Type | Description |
| --- | --- | --- |
| `modelValue` (`v-model`) | `string \| string[] \| undefined` | Open value (`string` / `undefined` for single; `string[]` for multiple) |

| Slot | Description |
| --- | --- |
| `default` | `AccordionItem` children |

### AccordionItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Stable id used with Accordion `v-model` |
| `disabled` | `boolean` | `false` | Disables the item trigger |

| Slot | Description |
| --- | --- |
| `default` | `AccordionTrigger` and `AccordionContent` |

Sets `data-state="open" \| "closed"` and `data-disabled` when disabled.

### AccordionTrigger

No props. Default slot is the trigger label.

Renders `<h3><button type="button">…</button></h3>` with `aria-expanded` and `aria-controls` linked to the item content.

### AccordionContent

No props. Default slot is the panel body.

Renders a `role="region"` panel with `aria-labelledby` pointing at the trigger; visibility toggles with `v-show` when the item is open.

### Emits

None beyond the Accordion `v-model` update.

## Accessibility

- Trigger is a native button with `aria-expanded` and `aria-controls`; content is a `role="region"` labelled by the trigger.
- Keyboard on the trigger: `Enter` / `Space` toggle; `ArrowDown` / `ArrowUp` move focus among enabled triggers (wraps).
- Disabled items do not toggle and are skipped for arrow focus.
- Heading wrapper is always `<h3>` (not configurable).

## Related

- [Tabs](/components/tabs) — mutually exclusive panels in a tablist
- [Card](/components/card) — static content grouping
