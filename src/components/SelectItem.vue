<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
import { SELECT_KEY, type SelectOption } from './selectContext'

export interface SelectItemProps {
  value: string
  disabled?: boolean
  /** Optional explicit label for the trigger; defaults to slot text / value. */
  label?: string
}

const props = withDefaults(defineProps<SelectItemProps>(), {
  disabled: false,
})

const select = inject(SELECT_KEY, null)
const rootRef = ref<HTMLElement | null>(null)

if (!select) {
  console.warn('[kablui] SelectItem must be used inside Select')
}

const optionId = computed(() => (select ? `${select.listboxId}-option-${props.value}` : undefined))

function resolveLabel(): string {
  return props.label || rootRef.value?.textContent?.trim() || props.value
}

function toOption(): SelectOption {
  return {
    value: props.value,
    label: resolveLabel(),
    disabled: props.disabled,
    id: optionId.value ?? props.value,
  }
}

onMounted(() => {
  select?.register(toOption())
})

onUpdated(() => {
  select?.update(props.value, toOption())
})

onBeforeUnmount(() => {
  select?.unregister(props.value)
})

const isSelected = computed(() => select?.model.value === props.value)
const isActive = computed(() => select?.activeValue.value === props.value)

const classes = computed(() =>
  [
    'flex w-full cursor-pointer items-center px-3 py-1.5 text-kablui-md text-kablui-fg',
    'rounded-kablui-sm',
    isActive.value ? 'bg-kablui-muted' : '',
    isSelected.value ? 'font-kablui-medium' : '',
    props.disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-kablui-muted',
  ].join(' '),
)

function onSelect() {
  if (props.disabled) return
  select?.selectValue(props.value)
}
</script>

<template>
  <div
    ref="rootRef"
    :id="optionId"
    role="option"
    :aria-selected="isSelected ? 'true' : 'false'"
    :aria-disabled="disabled || undefined"
    :data-value="value"
    :class="classes"
    @click="onSelect"
    @mouseenter="!disabled && select?.setActiveValue(value)"
  >
    <slot>{{ value }}</slot>
  </div>
</template>
