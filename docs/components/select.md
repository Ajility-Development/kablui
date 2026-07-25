# Select

Custom listbox select with Field-aware labeling. Options via an `options` prop or nested `SelectItem` children.

## Overview

Use `Select` for a single string value from a list. Prefer the `options` prop for data-driven lists, or compose with `SelectItem` for markup-driven options. If both are present, the `options` prop wins and slot items are not used. Optional `name` adds a hidden input for native form posts.

## Usage

### Options prop

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldError, FieldHint, Label, Select } from 'kablui'

const country = ref('')
</script>

<template>
  <Field :invalid="!country">
    <Label>Country</Label>
    <Select
      v-model="country"
      name="country"
      placeholder="Select a country"
      :options="[
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'de', label: 'Germany', disabled: true },
      ]"
    />
    <FieldHint>Arrow keys, typeahead, Escape.</FieldHint>
    <FieldError v-if="!country">Country is required.</FieldError>
  </Field>
</template>
```

### SelectItem children

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Field, Label, Select, SelectItem } from 'kablui'

const fruit = ref('apple')
</script>

<template>
  <Field>
    <Label>Favorite fruit</Label>
    <Select v-model="fruit" name="fruit" placeholder="Pick one">
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="cherry" disabled>Cherry</SelectItem>
      <SelectItem value="mango">Mango</SelectItem>
    </Select>
  </Field>
</template>
```

## Props / Models / Emits / Slots

### Select

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `SelectOptionProp[]` | — | Declarative options; omit when using `SelectItem` |
| `placeholder` | `string` | `'Select…'` | Trigger text when nothing is selected |
| `disabled` | `boolean` | `false` | Disables the trigger |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `name` | `string` | — | When set, renders a hidden input with the selected value |
| `id` | `string` | — | Overrides Field control id on the trigger |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Trigger size |

`SelectOptionProp`: `{ value: string; label: string; disabled?: boolean }`.

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `string` | — | Selected option value |

| Slot | Description |
| --- | --- |
| `default` | `SelectItem` children (used when `options` is empty / omitted) |

No custom emits. Extra attributes fall through to the trigger button.

### SelectItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | **Required.** Option value |
| `disabled` | `boolean` | `false` | Disables this option |
| `label` | `string` | — | Explicit trigger label; defaults to slot text, then `value` |

| Slot | Description |
| --- | --- |
| `default` | Option label content (falls back to `value`) |

Must be used inside `Select` (warns in the console otherwise).

## Accessibility

- Trigger is a button with `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, and Field-wired `id` / `aria-describedby` / `aria-invalid`.
- Popup has `role="listbox"` and `aria-activedescendant` for the active option.
- Options use `role="option"` with `aria-selected` and `aria-disabled` when disabled.
- Keyboard (trigger and open listbox):
  - `ArrowDown` / `ArrowUp` — open if closed; move active option when open
  - `Home` / `End` — first / last enabled option when open
  - `Enter` / `Space` — open, or select the active option when open
  - `Escape` — close and return focus to the trigger
  - Printable characters — typeahead (opens if closed); matches option labels
- Pointer down outside closes the listbox.
- Selecting an option closes the listbox and focuses the trigger.

## Related

- [Field](./field.md)
- [Radio](./radio.md)
- [Input](./input.md)
