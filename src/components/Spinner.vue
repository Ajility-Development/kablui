<script setup lang="ts">
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  /** Accessible name — rendered visually hidden for assistive tech. */
  label?: string
}

withDefaults(defineProps<SpinnerProps>(), {
  size: 'md',
})

const baseClasses = [
  'inline-block shrink-0 rounded-kablui-full border-2 border-current border-t-transparent',
  'animate-spin',
].join(' ')

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
}
</script>

<template>
  <span
    role="status"
    :aria-busy="label ? true : undefined"
    :aria-label="label || undefined"
    class="inline-flex items-center"
  >
    <span :class="[baseClasses, sizeClasses[size]]" aria-hidden="true" />
    <span v-if="label" class="sr-only">{{ label }}</span>
  </span>
</template>
