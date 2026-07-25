<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useAttrs,
} from 'vue'
import { useFieldControlAttrs } from '../composables/useField'
import { SELECT_KEY, type SelectOption } from './selectContext'

export interface SelectOptionProp {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  /** Declarative options; omit when composing with `SelectItem` children instead. */
  options?: SelectOptionProp[]
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
const fieldAttrs = useFieldControlAttrs({
  id: () => props.id,
  invalid: () => props.invalid,
})

const open = ref(false)
const activeValue = ref<string | undefined>()
const rootRef = ref<HTMLElement | null>(null)
const listboxRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)

const listboxId = `kablui-listbox-${Math.random().toString(36).slice(2, 9)}`
const registered = ref<SelectOption[]>([])

let typeaheadBuffer = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | null = null

const propOptions = computed<SelectOption[]>(() =>
  (props.options ?? []).map((opt) => ({
    value: opt.value,
    label: opt.label,
    disabled: opt.disabled,
    id: `${listboxId}-option-${opt.value}`,
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

function register(option: SelectOption) {
  const next = [...registered.value]
  const index = next.findIndex((o) => o.value === option.value)
  if (index === -1) next.push(option)
  else next[index] = option
  registered.value = next
}

function unregister(value: string) {
  registered.value = registered.value.filter((o) => o.value !== value)
}

function update(value: string, option: SelectOption) {
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

function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value || !rootRef.value) return
  const target = event.target as Node
  if (!rootRef.value.contains(target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
})

provide(SELECT_KEY, {
  listboxId,
  model,
  activeValue,
  open,
  register,
  unregister,
  update,
  selectValue,
  setActiveValue,
  disabled: computed(() => props.disabled),
})

const triggerBase = [
  'inline-flex w-full items-center justify-between gap-2 border border-kablui-border bg-kablui-bg text-kablui-fg',
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
      v-bind="attrs"
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

    <div
      v-show="open"
      :id="listboxId"
      ref="listboxRef"
      role="listbox"
      tabindex="-1"
      :aria-activedescendant="activeDescendant"
      class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-kablui-md border border-kablui-border bg-kablui-bg p-1 shadow-kablui-sm"
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
          :class="[
            'flex w-full cursor-pointer items-center px-3 py-1.5 text-kablui-md text-kablui-fg rounded-kablui-sm',
            activeValue === option.value ? 'bg-kablui-muted' : '',
            model === option.value ? 'font-kablui-medium' : '',
            option.disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-kablui-muted',
          ]"
          @click="selectValue(option.value)"
          @mouseenter="!option.disabled && setActiveValue(option.value)"
        >
          {{ option.label }}
        </div>
      </template>
      <slot v-else />
    </div>

    <input v-if="name" type="hidden" :name="name" :value="model ?? ''" :disabled="disabled" />
  </div>
</template>
