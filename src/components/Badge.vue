<script setup lang="ts">
import type { Tone } from '../types/tone'
import { BADGE_TONE_CLASSES } from '../utils/tones'

export interface BadgeProps {
  tone?: Tone
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<BadgeProps>(), {
  tone: 'neutral',
  size: 'md',
})

const baseClasses = [
  'inline-flex items-center font-kablui-medium',
  'rounded-kablui-full',
  'whitespace-nowrap',
].join(' ')

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-kablui-sm px-2 py-0.5',
  md: 'text-kablui-md px-2.5 py-1',
  lg: 'text-kablui-lg px-3 py-1.5',
}
</script>

<template>
  <span :class="[baseClasses, BADGE_TONE_CLASSES[tone], sizeClasses[size]]">
    <slot />
  </span>
</template>
