<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
import { useId } from '../composables/useId'
import { listItemBase, listItemState } from '../utils/listItemClasses'
import { SELECT_KEY, type RegisteredSelectOption } from './selectContext'

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
const optionId = useId('option')

if (!select) {
  console.warn('[kablui] SelectItem must be used inside Select')
}

function resolveLabel(): string {
  return props.label || rootRef.value?.textContent?.trim() || props.value
}

function toOption(): RegisteredSelectOption {
  return {
    value: props.value,
    label: resolveLabel(),
    disabled: props.disabled,
    id: optionId,
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
    listItemBase,
    listItemState({
      active: isActive.value,
      selected: isSelected.value,
      disabled: props.disabled,
      size: select?.size.value ?? 'md',
    }),
  ]
    .filter(Boolean)
    .join(' '),
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
