<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  useAttrs,
  useSlots,
  watch,
  type CSSProperties,
} from 'vue'
import { useDismissible } from '../composables/useDismissible'
import { useFieldControlAttrs } from '../composables/useField'
import { useFloating } from '../composables/useFloating'
import { useId } from '../composables/useId'
import { useOverlayStack } from '../composables/useOverlayStack'
import { listItemBase, listItemState } from '../utils/listItemClasses'
import { omitDataTestId, partTestId, resolveTestId, valueTestId } from '../utils/testId'
import {
  SELECT_KEY,
  type RegisteredSelectOption,
  type SelectOption,
} from './selectContext'

export type { SelectOption }

export interface SelectProps {
  /** Declarative options; omit when composing with `SelectItem` children instead. */
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  name?: string
  id?: string
  size?: 'sm' | 'md' | 'lg'
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SelectProps>(), {
  placeholder: 'Select…',
  disabled: false,
  invalid: false,
  size: 'md',
})

const model = defineModel<string>()

const attrs = useAttrs()
const testIdBase = computed(() => resolveTestId(attrs, 'select'))
const triggerAttrs = computed(() => omitDataTestId(attrs))
const slots = useSlots()
const fieldAttrs = useFieldControlAttrs({
  id: () => props.id,
  invalid: () => props.invalid,
})

const open = ref(false)
const activeValue = ref<string | undefined>()
const rootRef = ref<HTMLElement | null>(null)
const listboxRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)

const listboxId = useId('listbox')
const registered = ref<RegisteredSelectOption[]>([])
const optionIdCache = new Map<string, string>()

let typeaheadBuffer = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | null = null

function optionIdFor(value: string): string {
  let id = optionIdCache.get(value)
  if (!id) {
    id = useId('option')
    optionIdCache.set(value, id)
  }
  return id
}

const propOptions = computed<RegisteredSelectOption[]>(() =>
  (props.options ?? []).map((opt) => ({
    value: opt.value,
    label: opt.label,
    disabled: opt.disabled,
    id: optionIdFor(opt.value),
  })),
)

const allOptions = computed(() => {
  if (propOptions.value.length > 0) return propOptions.value
  return registered.value
})

const enabledOptions = computed(() => allOptions.value.filter((o) => !o.disabled))

const selectedOption = computed(() =>
  allOptions.value.find((o) => o.value === model.value),
)

const displayLabel = computed(() => selectedOption.value?.label ?? '')

const activeDescendant = computed(() => {
  if (!open.value || !activeValue.value) return undefined
  return allOptions.value.find((o) => o.value === activeValue.value)?.id
})

watch(
  () => [(props.options?.length ?? 0) > 0, !!slots.default] as const,
  ([hasOptions, hasSlot]) => {
    if (hasOptions && hasSlot) {
      console.warn(
        '[kablui] Select: both `options` prop and SelectItem children were provided; `options` takes precedence',
      )
    }
  },
  { immediate: true },
)

function register(option: RegisteredSelectOption) {
  const next = [...registered.value]
  const index = next.findIndex((o) => o.value === option.value)
  if (index === -1) next.push(option)
  else next[index] = option
  registered.value = next
}

function unregister(value: string) {
  registered.value = registered.value.filter((o) => o.value !== value)
}

function update(value: string, option: RegisteredSelectOption) {
  const index = registered.value.findIndex((o) => o.value === value)
  if (index === -1) return
  const prev = registered.value[index]!
  const label = option.label || prev.label || option.value
  if (
    prev.label === label &&
    prev.disabled === option.disabled &&
    prev.id === option.id
  ) {
    return
  }
  const next = [...registered.value]
  next[index] = { ...option, label }
  registered.value = next
}

function setActiveValue(value: string) {
  activeValue.value = value
}

function selectValue(value: string) {
  const option = allOptions.value.find((o) => o.value === value)
  if (!option || option.disabled) return
  model.value = value
  open.value = false
  activeValue.value = value
  nextTick(() => triggerRef.value?.focus())
}

function resolveInitialActive(): string | undefined {
  const selected = model.value
  if (selected && enabledOptions.value.some((o) => o.value === selected)) {
    return selected
  }
  return enabledOptions.value[0]?.value
}

function openListbox() {
  if (props.disabled) return
  open.value = true
  activeValue.value = resolveInitialActive()
  nextTick(() => {
    listboxRef.value?.focus()
  })
}

function closeListbox() {
  open.value = false
  nextTick(() => triggerRef.value?.focus())
}

function dismiss() {
  open.value = false
  nextTick(() => triggerRef.value?.focus())
}

function toggleListbox() {
  if (open.value) closeListbox()
  else openListbox()
}

function moveActive(delta: number) {
  const list = enabledOptions.value
  if (list.length === 0) return
  const currentIndex = list.findIndex((o) => o.value === activeValue.value)
  const start = currentIndex === -1 ? (delta > 0 ? -1 : 0) : currentIndex
  const nextIndex = (start + delta + list.length) % list.length
  activeValue.value = list[nextIndex]!.value
}

function moveToEdge(edge: 'start' | 'end') {
  const list = enabledOptions.value
  if (list.length === 0) return
  activeValue.value = edge === 'start' ? list[0]!.value : list[list.length - 1]!.value
}

function typeahead(char: string) {
  typeaheadBuffer += char.toLowerCase()
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
  typeaheadTimer = setTimeout(() => {
    typeaheadBuffer = ''
  }, 500)

  const list = enabledOptions.value
  const startIndex = Math.max(
    0,
    list.findIndex((o) => o.value === activeValue.value),
  )
  for (let i = 0; i < list.length; i++) {
    const option = list[(startIndex + i) % list.length]!
    if (option.label.toLowerCase().startsWith(typeaheadBuffer)) {
      activeValue.value = option.value
      if (!open.value) {
        model.value = option.value
      }
      return
    }
  }
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!open.value) openListbox()
      else moveActive(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!open.value) openListbox()
      else moveActive(-1)
      break
    case 'Home':
      if (open.value) {
        event.preventDefault()
        moveToEdge('start')
      }
      break
    case 'End':
      if (open.value) {
        event.preventDefault()
        moveToEdge('end')
      }
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!open.value) openListbox()
      else if (activeValue.value) selectValue(activeValue.value)
      break
    case 'Escape':
      if (open.value) {
        event.preventDefault()
        closeListbox()
      }
      break
    default:
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        if (!open.value) openListbox()
        typeahead(event.key)
      }
  }
}

function onListboxKeydown(event: KeyboardEvent) {
  onTriggerKeydown(event)
}

const { register: registerOverlay, unregister: unregisterOverlay } = useOverlayStack('menu')

const { style: floatingStyle } = useFloating(triggerRef, listboxRef, {
  open,
  placement: 'bottom-start',
})

const listboxStyle = computed<CSSProperties>(() => {
  const width = triggerRef.value?.offsetWidth
  return {
    ...floatingStyle.value,
    ...(width ? { width: `${width}px` } : {}),
  }
})

watch(
  open,
  (isOpen) => {
    if (isOpen) registerOverlay()
    else unregisterOverlay()
  },
  { immediate: true },
)

useDismissible(rootRef, {
  active: open,
  onDismiss: dismiss,
  escape: true,
  outside: true,
})

onBeforeUnmount(() => {
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
})

provide(SELECT_KEY, {
  listboxId,
  model,
  activeValue,
  open,
  size: computed(() => props.size),
  register,
  unregister,
  update,
  selectValue,
  setActiveValue,
  disabled: computed(() => props.disabled),
  testIdBase,
})

const triggerBase = [
  'inline-flex w-full items-center justify-between gap-2 border border-kablui-border-strong bg-kablui-bg text-kablui-fg',
  'rounded-kablui-md font-kablui-normal',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

const sizeClasses: Record<NonNullable<SelectProps['size']>, string> = {
  sm: 'text-kablui-sm px-2 py-1',
  md: 'text-kablui-md px-3 py-1.5',
  lg: 'text-kablui-lg px-4 py-2',
}

const triggerClasses = computed(() => [
  triggerBase,
  sizeClasses[props.size],
  fieldAttrs.invalid.value ? 'border-kablui-danger' : '',
  !displayLabel.value ? 'text-kablui-muted-fg' : '',
])

const listboxClasses = [
  'z-kablui-menu max-h-60 overflow-auto rounded-kablui-md border border-kablui-border bg-kablui-bg',
  'p-1 text-kablui-md text-kablui-fg shadow-kablui-md',
  'focus:outline-none',
].join(' ')

function optionClasses(option: RegisteredSelectOption) {
  return [
    listItemBase,
    listItemState({
      active: activeValue.value === option.value,
      selected: model.value === option.value,
      disabled: !!option.disabled,
      size: props.size,
    }),
  ]
    .filter(Boolean)
    .join(' ')
}

/** Name the listbox via the trigger id (Field label) or placeholder fallback. */
const listboxLabelledBy = computed(() => fieldAttrs.id.value)
const listboxAriaLabel = computed(() =>
  fieldAttrs.id.value ? undefined : props.placeholder,
)
</script>

<template>
  <div ref="rootRef" class="relative w-full" data-slot="select">
    <button
      ref="triggerRef"
      type="button"
      :id="fieldAttrs.id.value"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="listboxId"
      :aria-invalid="fieldAttrs.ariaInvalid.value"
      :aria-describedby="fieldAttrs.describedBy.value"
      :class="triggerClasses"
      :data-testid="testIdBase"
      v-bind="triggerAttrs"
      @click="toggleListbox"
      @keydown="onTriggerKeydown"
    >
      <span class="truncate">{{ displayLabel || placeholder }}</span>
      <svg
        class="size-4 shrink-0 text-kablui-muted-fg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-show="open"
        :id="listboxId"
        ref="listboxRef"
        role="listbox"
        tabindex="-1"
        :aria-labelledby="listboxLabelledBy"
        :aria-label="listboxAriaLabel"
        :aria-activedescendant="activeDescendant"
        :class="listboxClasses"
        :style="listboxStyle"
        :data-testid="partTestId(testIdBase, 'listbox')"
        @pointerdown.stop
        @keydown="onListboxKeydown"
      >
        <template v-if="propOptions.length">
          <div
            v-for="option in propOptions"
            :id="option.id"
            :key="option.value"
            role="option"
            :aria-selected="model === option.value ? 'true' : 'false'"
            :aria-disabled="option.disabled || undefined"
            :data-value="option.value"
            :data-testid="valueTestId(testIdBase, 'option', option.value)"
            :class="optionClasses(option)"
            @click="selectValue(option.value)"
            @mouseenter="!option.disabled && setActiveValue(option.value)"
          >
            {{ option.label }}
          </div>
        </template>
        <slot v-else />
      </div>
    </Teleport>

    <input v-if="name" type="hidden" :name="name" :value="model ?? ''" :disabled="disabled" />
  </div>
</template>
