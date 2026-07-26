# Field

Field owns labeling and description wiring for a single control. Nest `FieldLabel`, the control, `FieldHint`, and `FieldError` so ids, `aria-describedby`, and invalid state stay in sync.

## Overview

Use `Field` as the wrapper around one form control (or a control group such as `RadioGroup`). It provides a shared control id and description ids to descendants. Set `invalid` on `Field` to mark nested field-aware controls invalid (danger border, `aria-invalid`) without passing props to each child.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldError, FieldHint, FieldLabel, Input } from 'kablui'

const name = ref('')
</script>

<template>
  <Field :invalid="!name">
    <FieldLabel required>Name</FieldLabel>
    <Input v-model="name" name="name" placeholder="Ada Lovelace" />
    <FieldHint>Used on invoices and receipts.</FieldHint>
    <FieldError v-if="!name">Name is required.</FieldError>
  </Field>
</template>
```

Checkbox / Switch with an adjacent label (same Field-owned id):

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

### Parts

| Part | Role |
| --- | --- |
| `Field` | Provides context (`controlId`, hint/error ids, `invalid`) |
| `FieldLabel` | Native `<label>`; `for` defaults to the Field control id |
| Control | `Input`, `Textarea`, `Checkbox`, `Switch`, `Select`, `RadioGroup`, etc. consume Field context |
| `FieldHint` | Helper text; registers into `aria-describedby` |
| `FieldError` | Error text with `role="alert"`; registers into `aria-describedby` when content is present |

Pass a stable `id` on `Field` when you need a predictable control id. Override with `FieldLabel`’s `for` or the control’s `id` when composing outside the default wiring.

## Props / Models / Emits / Slots

### Field

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `invalid` | `boolean` | `false` | Marks the field invalid for nested field-aware controls |
| `id` | `string` | — | Stable id for the nested control; otherwise auto-generated |

| Slot | Description |
| --- | --- |
| `default` | FieldLabel, control, hint, and error |

No models or emits.

### FieldLabel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `required` | `boolean` | `false` | Shows a danger `*` after the label (`aria-hidden`) |
| `for` | `string` | — | Explicit control id; defaults to Field `controlId` |

| Slot | Description |
| --- | --- |
| `default` | Label text |

Extra attributes fall through to the native `<label>`.

### FieldHint

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| — | — | — | No props (`FieldHintProps` is empty) |

| Slot | Description |
| --- | --- |
| `default` | Hint text |

Renders a `<p>` with the Field hint id. Mounting registers the hint for `aria-describedby`.

### FieldError

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| — | — | — | No props (`FieldErrorProps` is empty) |

| Slot | Description |
| --- | --- |
| `default` | Error message |

Renders only when the default slot has content. When shown, uses `role="alert"` and the Field error id, and is included in `aria-describedby`. Visibility is driven by slot content—gate the message with `v-if` (or omit the slot) when you only want errors while invalid.

## Accessibility

- Field generates related ids and merges hint + error into `aria-describedby` for field-aware controls.
- Nested controls that use Field context set `aria-invalid="true"` when Field (or the control) is invalid.
- `FieldLabel` associates via native `for` / control `id`.
- `FieldError` uses `role="alert"` when rendered.
- Required indicator on `FieldLabel` is presentational (`aria-hidden="true"`).

## Related

- [Input](./input.md)
- [Textarea](./textarea.md)
- [Checkbox](./checkbox.md)
- [RadioGroup](./radio-group.md)
- [Switch](./switch.md)
- [Select](./select.md)
