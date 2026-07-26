<script setup lang="ts">
import { computed } from 'vue'

export interface IconProps {
  size?: 'sm' | 'md' | 'lg'
  /** Accessible name — when set, icon exits decorative mode (`role="img"` + `aria-label`). */
  label?: string
  /** Native title tooltip only — does not affect decorative vs meaningful mode. */
  title?: string
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 'md',
})

const baseClasses = [
  'inline-flex shrink-0 items-center justify-center',
  'text-current',
  '[&>svg]:size-full',
].join(' ')

const sizeClasses: Record<NonNullable<IconProps['size']>, string> = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
}

/** Decorative unless `label` is set — `title` alone stays decorative. */
const isDecorative = computed(() => !props.label)
</script>

<template>
  <span
    data-testid="icon"
    :class="[baseClasses, sizeClasses[size]]"
    :role="isDecorative ? undefined : 'img'"
    :aria-hidden="isDecorative ? true : undefined"
    :aria-label="label || undefined"
    :title="title"
  >
    <slot />
  </span>
</template>
