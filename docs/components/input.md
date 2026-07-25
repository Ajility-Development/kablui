# Input

Single-line text field with Field-aware labeling, invalid styling, and `v-model`.

## Overview

Use `Input` for short text values. Inside a `Field`, it picks up the shared control id, `aria-describedby`, and invalid state automatically. You can also set `invalid` / `id` on the control itself.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldError, FieldHint, Input, Label } from 'kablui'

const name = ref('')
</script>

<template>
  <Field :invalid="!name">
    <Label required>Name</Label>
    <Input v-model="name" name="name" placeholder="Ada Lovelace" />
    <FieldHint>Used on invoices and receipts.</FieldHint>
    <FieldError v-if="!name">Name is required.</FieldError>
  </Field>
</template>
```

Sizes and native types:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Input } from 'kablui'

const email = ref('')
</script>

<template>
  <Input v-model="email" type="email" size="sm" placeholder="you@example.com" />
  <Input v-model="email" type="email" size="md" />
  <Input v-model="email" type="email" size="lg" disabled />
</template>
```

## Props / Models / Emits / Slots

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `string` | `'text'` | Native input `type` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size |
| `disabled` | `boolean` | `false` | Disables the input |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `placeholder` | `string` | — | Placeholder text |
| `name` | `string` | — | Native `name` |
| `id` | `string` | — | Overrides Field control id when set |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `string` | `''` | Input value |

No custom emits or slots. Extra attributes fall through to the native `<input>` (`inheritAttrs: false`, applied on the input).

## Accessibility

- Uses a native `<input>`.
- Inside `Field`, wires `id`, `aria-describedby` (hint/error), and `aria-invalid` when invalid.
- Focus styles use a visible focus ring (`focus-visible`).

## Related

- [Field](./field.md)
- [Textarea](./textarea.md)
- [Select](./select.md)
