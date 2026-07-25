<script setup lang="ts">
import { computed, provide } from 'vue'
import { useFieldControlAttrs } from '../composables/useField'
import { RADIO_GROUP_KEY } from './radioContext'

export interface RadioGroupProps {
  name?: string
  disabled?: boolean
  invalid?: boolean
  orientation?: 'horizontal' | 'vertical'
  id?: string
}

let nameCounter = 0

const props = withDefaults(defineProps<RadioGroupProps>(), {
  disabled: false,
  invalid: false,
  orientation: 'vertical',
})

const model = defineModel<string>()

const fieldAttrs = useFieldControlAttrs({
  id: () => props.id,
  invalid: () => props.invalid,
})

const generatedName = `kablui-radio-${++nameCounter}`
const groupName = computed(() => props.name ?? generatedName)
const radios = new Set<HTMLInputElement>()

function register(el: HTMLInputElement) {
  radios.add(el)
}

function unregister(el: HTMLInputElement) {
  radios.delete(el)
}

function enabledRadios(): HTMLInputElement[] {
  return [...radios].filter((el) => !el.disabled)
}

function focusRelative(current: HTMLInputElement, delta: number) {
  const list = enabledRadios()
  const index = list.indexOf(current)
  if (index === -1 || list.length === 0) return
  const next = list[(index + delta + list.length) % list.length]!
  next.focus()
  model.value = next.value
}

provide(RADIO_GROUP_KEY, {
  name: groupName,
  model,
  disabled: computed(() => props.disabled),
  invalid: computed(() => fieldAttrs.invalid.value),
  register,
  unregister,
  focusRelative,
})

const orientationClasses: Record<NonNullable<RadioGroupProps['orientation']>, string> = {
  vertical: 'flex-col gap-2',
  horizontal: 'flex-row flex-wrap gap-3',
}
</script>

<template>
  <div
    role="radiogroup"
    :id="fieldAttrs.id.value"
    :aria-invalid="fieldAttrs.ariaInvalid.value"
    :aria-describedby="fieldAttrs.describedBy.value"
    :aria-orientation="orientation"
    :aria-disabled="disabled || undefined"
    :class="['flex', orientationClasses[orientation]]"
    data-slot="radio-group"
  >
    <slot />
  </div>
</template>
