<script setup lang="ts">
import { computed } from 'vue'
import {
  base,
  sizeClasses,
  variantClasses,
  type ButtonSize,
  type ButtonVariant,
} from '../utils/buttonClasses'
import Spinner from './Spinner.vue'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  /** Shows a leading spinner and disables the button while true. */
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'solid',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const spinnerSize = computed(() => (props.size === 'lg' ? 'md' : 'sm'))

function onClick(event: MouseEvent) {
  if (isDisabled.value) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    data-testid="button"
    :class="[base, variantClasses[variant], sizeClasses[size]]"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="inline-flex"
      aria-hidden="true"
    >
      <Spinner :size="spinnerSize" />
    </span>
    <slot />
  </button>
</template>
