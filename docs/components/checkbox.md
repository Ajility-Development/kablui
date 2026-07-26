# Checkbox

Boolean checkbox with optional indeterminate state and Field-aware labeling.

## Overview

Use `Checkbox` for on/off choices. Pair it with `FieldLabel` inside `Field` so click-to-focus/toggle wiring stays correct. Supports `indeterminate` for a mixed state (DOM `indeterminate` + `aria-checked="mixed"`).

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, Field, FieldLabel } from 'kablui'

const subscribe = ref(false)
</script>

<template>
  <Field>
    <div class="flex items-center gap-2">
      <Checkbox v-model="subscribe" name="subscribe" />
      <FieldLabel>Subscribe to product updates</FieldLabel>
    </div>
  </Field>
</template>
```

Indeterminate:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from 'kablui'

const allSelected = ref(false)
</script>

<template>
  <Checkbox v-model="allSelected" indeterminate />
</template>
```

## Props / Models / Emits / Slots

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `indeterminate` | `boolean` | `false` | Sets the native indeterminate property |
| `disabled` | `boolean` | `false` | Disables the checkbox |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `name` | `string` | — | Native `name` |
| `value` | `string` | `'on'` | Native `value` when checked |
| `id` | `string` | — | Overrides Field control id when set |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `boolean` | `false` | Checked state |

No custom emits or slots. Extra attributes fall through to the native `<input type="checkbox">`.

## Accessibility

- Native checkbox input.
- Sets `aria-checked` to `'true'` / `'false'`, or `'mixed'` when `indeterminate`.
- Inside `Field`, wires `id`, `aria-describedby`, and `aria-invalid` when invalid.
- Focus styles use a visible focus ring (`focus-visible`).

## Related

- [Field](./field.md)
- [Switch](./switch.md)
- [RadioGroup](./radio-group.md)
