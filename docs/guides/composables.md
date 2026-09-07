# Composables

Root-exported helpers for field accessibility wiring and custom overlays. Prefer the built-in [Field](/components/field), [Dialog](/components/dialog), [Menu](/components/menu), [Popover](/components/popover), [Select](/components/select), and [Tooltip](/components/tooltip) when they fit. Use these composables when you are building a custom control or overlay that should match the same behavior.

`useToast` is documented on the [Toast](/components/toast) page.

## Field context

`provideField`, `useField`, and `useFieldControlAttrs` share a control id, hint/error ids, and invalid state so a label, control, hint, and error stay associated.

`Field` already calls `provideField`. Field-aware controls (`Input`, `Textarea`, `Checkbox`, `Switch`, `Select`, `RadioGroup`) already call `useFieldControlAttrs`. Reach for these helpers when you wrap a native control or a third-party input that should participate in a `Field`.

### `provideField`

Call once in the field wrapper’s `setup`. Provides context to descendants and returns the same `FieldContext`.

```ts
import { provideField, type ProvideFieldOptions, type FieldContext } from 'kablui'

function provideField(options?: ProvideFieldOptions): FieldContext
```

| Option | Type | Description |
| --- | --- | --- |
| `invalid` | `MaybeRefOrGetter<boolean \| undefined>` | Field-level invalid; coerced with `!!` |
| `id` | `MaybeRefOrGetter<string \| undefined>` | Stable control id; otherwise auto-generated (`kablui-control-…`) |

Options are reactive: a `ref` or getter is re-read when it changes.

### `useField`

```ts
import { useField, type FieldContext } from 'kablui'

function useField(): FieldContext | null
```

Returns `null` outside a `provideField` / `Field` ancestor (it does not throw).

### `FieldContext`

| Member | Type | Description |
| --- | --- | --- |
| `controlId` | `ComputedRef<string>` | Id for the control and `label[for]` |
| `hintId` | `string` | Id for hint text |
| `errorId` | `string` | Id for error text |
| `invalid` | `ComputedRef<boolean>` | Field-level invalid from `provideField` |
| `describedBy` | `ComputedRef<string \| undefined>` | Space-joined hint and/or error ids, or `undefined` |
| `setHasHint` | `(value: boolean) => void` | Include or drop the hint id in `describedBy` |
| `setHasError` | `(value: boolean) => void` | Include or drop the error id in `describedBy` |

`describedBy` only includes ids after `setHasHint(true)` / `setHasError(true)`. `FieldHint` and `FieldError` do this when they have content.

### `useFieldControlAttrs`

Merges a control’s local `id` / `invalid` with Field context for attribute binding.

```ts
import { useFieldControlAttrs } from 'kablui'

function useFieldControlAttrs(options: {
  id?: MaybeRefOrGetter<string | undefined>
  invalid?: MaybeRefOrGetter<boolean | undefined>
}): {
  id: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  describedBy: ComputedRef<string | undefined>
  ariaInvalid: ComputedRef<'true' | undefined>
}
```

| Return | Behavior |
| --- | --- |
| `id` | Local `id` if set, otherwise the Field `controlId` |
| `invalid` | `true` when the local prop **or** Field context is invalid |
| `describedBy` | Field `describedBy` only (no local override) |
| `ariaInvalid` | `'true'` when `invalid`, otherwise `undefined` |

Outside a Field, `id` is only the local value (or `undefined`), `describedBy` is `undefined`, and `invalid` comes from the local option alone.

### Example

```vue
<script setup lang="ts">
import { useFieldControlAttrs } from 'kablui'

const props = defineProps<{
  id?: string
  invalid?: boolean
}>()

const fieldAttrs = useFieldControlAttrs({
  id: () => props.id,
  invalid: () => props.invalid,
})
</script>

<template>
  <input
    :id="fieldAttrs.id.value"
    :aria-invalid="fieldAttrs.ariaInvalid.value"
    :aria-describedby="fieldAttrs.describedBy.value"
  />
</template>
```

For a custom field wrapper, call `provideField({ invalid, id })` in that wrapper instead of nesting another `Field`.

## `useFloating`

Anchors a floating element with `position: fixed` from `getBoundingClientRect`. Menu, Popover, Tooltip, and Select use this internally.

### When to use

Custom popovers, menus, or tooltips that should sit next to an anchor and stay aligned on scroll/resize. This helper does not manage open state, focus, or dismiss.

### Signature

```ts
import {
  useFloating,
  type FloatingPlacement,
  type UseFloatingOptions,
  type UseFloatingReturn,
} from 'kablui'

function useFloating(
  anchorRef: Ref<HTMLElement | null | undefined>,
  floatingRef: Ref<HTMLElement | null | undefined>,
  options: UseFloatingOptions,
): UseFloatingReturn
```

| Argument | Description |
| --- | --- |
| `anchorRef` | Element to position against |
| `floatingRef` | Element that receives the returned `style` |
| `options.open` | `MaybeRefOrGetter<boolean>` — measure only while open |
| `options.placement` | `MaybeRefOrGetter<FloatingPlacement>` |

Returns `{ style }`, a `Ref<CSSProperties>` to bind on the floating node.

While closed, `style` is empty. While open but either ref is missing, `style` is a hidden placeholder (`position: fixed; visibility: hidden`) so a teleported node stays out of flow until the first successful measure. After measure, `style` is `{ position: 'fixed', top, left }`.

Position updates on window `resize` and capture-phase `scroll` while open. If the preferred **side** is clipped by the viewport, placement flips to the opposite side and keeps the same alignment. There is no collision avoidance beyond that single primary-axis flip.

### Placement

`FloatingPlacement` is a side, optionally with alignment. A side alone means center (`bottom` ≡ `bottom-center`).

| Type | Values |
| --- | --- |
| `FloatingSide` | `'top'` \| `'bottom'` \| `'left'` \| `'right'` |
| `FloatingAlign` | `'start'` \| `'center'` \| `'end'` |
| `FloatingPlacement` | `FloatingSide` or `` `${FloatingSide}-${FloatingAlign}` `` |

Examples: `'top'`, `'bottom-start'`, `'right-end'`.

### Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useFloating, type FloatingPlacement } from 'kablui'

const open = ref(false)
const placement = ref<FloatingPlacement>('bottom-start')
const anchorRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)

const { style } = useFloating(anchorRef, floatingRef, { open, placement })
</script>

<template>
  <button ref="anchorRef" type="button" @click="open = !open">Toggle</button>
  <Teleport to="body">
    <div v-show="open" ref="floatingRef" :style="style" role="dialog">
      Floating content
    </div>
  </Teleport>
</template>
```

## `useDismissible`

Dismisses an overlay on Escape and, optionally, outside `pointerdown`. Dialog, Menu, Popover, and Select use this internally.

### When to use

Custom overlays that should close the same way kablui overlays do. Pair with `useFloating` when the overlay is anchored. This helper does not lock scroll, trap focus, or set z-index.

### Signature

```ts
import { useDismissible, type UseDismissibleOptions } from 'kablui'

function useDismissible(
  rootRef: Ref<HTMLElement | null | undefined>,
  options: UseDismissibleOptions,
): void
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | `MaybeRefOrGetter<boolean>` | — | Listen only while truthy |
| `onDismiss` | `() => void` | — | Called when a handled dismiss fires |
| `escape` | `boolean` | `true` | Handle Escape (`preventDefault`, then `onDismiss`) |
| `outside` | `boolean` | `false` | Dismiss on `pointerdown` outside `rootRef` |

`rootRef` is the “inside” region for `outside`. Pointer events on nodes that are **not** descendants of that element count as outside.

Teleported content is usually outside a trigger wrapper. Either put `rootRef` on a node that contains the floating element, or stop `pointerdown` on the teleported node so it is not treated as outside (Menu, Popover, and Select do the latter).

### Stacking

Active instances push onto a LIFO stack. Only the topmost entry that has `escape` enabled handles Escape; only the topmost with `outside` enabled handles outside pointerdown.

Nested kablui overlays also coordinate Escape through an internal overlay stack so a Menu inside a Dialog does not close both at once. That stack is not a public export.

Listeners attach to `document` and are removed when the calling scope is disposed.

### Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDismissible, useFloating } from 'kablui'

const open = ref(false)
const anchorRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

const { style } = useFloating(anchorRef, panelRef, {
  open,
  placement: 'bottom-start',
})

useDismissible(panelRef, {
  active: open,
  onDismiss: () => {
    open.value = false
  },
  escape: true,
  outside: true,
})
</script>

<template>
  <button ref="anchorRef" type="button" @click="open = true">Open</button>
  <Teleport to="body">
    <div
      v-show="open"
      ref="panelRef"
      :style="style"
      role="dialog"
    >
      Panel
    </div>
  </Teleport>
</template>
```

Here `rootRef` is the panel itself, so a click on the panel is inside and a click anywhere else (including the trigger) dismisses.

## Related

- [Field](/components/field) — labeling and description wiring
- [Toast](/components/toast) — `useToast`
- [Dialog](/components/dialog), [Popover](/components/popover), [Menu](/components/menu), [Tooltip](/components/tooltip), [Select](/components/select) — overlays that use `useFloating` / `useDismissible`
- [Tree-shaking & imports](/guides/tree-shaking) — named exports from the package root
