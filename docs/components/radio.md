# Radio

Exclusive choice within a `RadioGroup`. Documented together as one compound pattern.

## Overview

Wrap options in `RadioGroup` and nest `Radio` children (each with a `value`). The group holds `v-model` (selected value string), shared `name`, disabled/invalid state, and arrow-key focus movement. Use `Field` + `Label` on the group; label each option with a native `<label>` (or your own markup) around `Radio`.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldError, Label, Radio, RadioGroup } from 'kablui'

const plan = ref('pro')
</script>

<template>
  <Field :invalid="!plan">
    <Label>Plan</Label>
    <RadioGroup v-model="plan" name="plan" orientation="horizontal">
      <label class="inline-flex items-center gap-2">
        <Radio value="free" /> Free
      </label>
      <label class="inline-flex items-center gap-2">
        <Radio value="pro" /> Pro
      </label>
      <label class="inline-flex items-center gap-2">
        <Radio value="enterprise" disabled /> Enterprise
      </label>
    </RadioGroup>
    <FieldError v-if="!plan">Choose a plan.</FieldError>
  </Field>
</template>
```

## Props / Models / Emits / Slots

### RadioGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | auto-generated | Shared native `name` for radios |
| `disabled` | `boolean` | `false` | Disables all radios in the group |
| `invalid` | `boolean` | `false` | Local invalid; ORs with Field `invalid` |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout and `aria-orientation` |
| `id` | `string` | — | Group element id; defaults to Field control id |

### Models

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | `string` | — | Selected radio `value` |

| Slot | Description |
| --- | --- |
| `default` | `Radio` options (and labels) |

No custom emits.

### Radio

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | **Required.** Value selected when this radio is chosen |
| `disabled` | `boolean` | `false` | Disables this option (also inherits group `disabled`) |
| `id` | `string` | — | Optional native id on this radio |

No models, emits, or slots. Must be used inside `RadioGroup` (warns in the console otherwise). Extra attributes fall through to the native radio input.

Invalid styling on each `Radio` comes from the group/Field invalid state—not a per-radio `invalid` prop.

## Accessibility

- `RadioGroup` renders a container with `role="radiogroup"`, `aria-orientation`, and optional `aria-disabled`.
- Inside `Field`, the group gets `id`, `aria-describedby`, and `aria-invalid` when invalid.
- Each `Radio` is a native `<input type="radio">` with `aria-invalid` when the group is invalid.
- Arrow keys on a radio move focus among enabled options and select the focused value: `ArrowDown` / `ArrowRight` forward, `ArrowUp` / `ArrowLeft` backward.

## Related

- [Field](./field.md)
- [Checkbox](./checkbox.md)
- [Select](./select.md)
