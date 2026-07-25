<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useFieldControlAttrs } from '../composables/useField'

export interface SwitchProps {
  disabled?: boolean
  invalid?: boolean
  name?: string
  id?: string
  value?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SwitchProps>(), {
  disabled: false,
  invalid: false,
  value: 'on',
})

const model = defineModel<boolean>({ default: false })

const attrs = useAttrs()
const fieldAttrs = useFieldControlAttrs({
  id: () => props.id,
  invalid: () => props.invalid,
})

const trackClasses = computed(() =>
  [
    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-kablui-border',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
    model.value ? 'bg-kablui-accent border-kablui-accent' : 'bg-kablui-muted',
    fieldAttrs.invalid.value ? 'border-kablui-danger' : '',
  ].join(' '),
)

const thumbClasses = computed(() =>
  [
    'pointer-events-none inline-block size-3.5 rounded-full bg-kablui-bg shadow-kablui-sm',
    'transition-transform',
    model.value ? 'translate-x-4' : 'translate-x-0.5',
  ].join(' '),
)

function toggle() {
  if (props.disabled) return
  model.value = !model.value
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    toggle()
  }
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :id="fieldAttrs.id.value"
    :disabled="disabled"
    :aria-checked="model ? 'true' : 'false'"
    :aria-invalid="fieldAttrs.ariaInvalid.value"
    :aria-describedby="fieldAttrs.describedBy.value"
    :class="trackClasses"
    v-bind="attrs"
    @click="toggle"
    @keydown="onKeydown"
  >
    <span :class="thumbClasses" aria-hidden="true" />
  </button>
  <input
    v-if="name"
    type="hidden"
    :name="name"
    :value="model ? value : ''"
    :disabled="disabled"
  />
</template>
