# Textarea

Multi-line text field with Field-aware labeling, invalid styling, and `v-model`.

## Overview

Use `Textarea` for longer plain-text values. Behavior matches `Input` for Field context, sizes, and invalid/disabled states, with a `rows` prop for height.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldHint, FieldLabel, Textarea } from 'kablui'

const bio = ref('')
</script>

<template>
  <Field>
    <FieldLabel>Bio</FieldLabel>
    <Textarea v-model="bio" name="bio" :rows="3" placeholder="Short introduction" />
    <FieldHint>Plain text, a few sentences.</FieldHint>
  </Field>
</template>
```

## Props / Models / Emits / Slots

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size |
| `rows` | `number` | `3` | Native `rows` |
| `disabled` | `boolean` | `false` | Disables the textarea |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `placeholder` | `string` | — | Placeholder text |
| `name` | `string` | — | Native `name` |
| `id` | `string` | — | Overrides Field control id when set |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `string` | `''` | Textarea value |

No custom emits or slots. Extra attributes fall through to the native `<textarea>`.

## Accessibility

- Uses a native `<textarea>`.
- Inside `Field`, wires `id`, `aria-describedby`, and `aria-invalid` when invalid.
- Focus styles use a visible focus ring (`focus-visible`).

## Related

- [Field](./field.md)
- [Input](./input.md)
