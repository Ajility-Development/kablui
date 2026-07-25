<script setup lang="ts">
export interface BadgeProps {
  tone?: 'neutral' | 'accent' | 'danger'
  size?: 'sm' | 'md'
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

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-kablui-muted text-kablui-fg',
  accent: 'bg-kablui-accent text-kablui-accent-fg',
  danger: 'bg-kablui-danger text-kablui-danger-fg',
}

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-kablui-sm px-2 py-0.5',
  md: 'text-kablui-md px-2.5 py-1',
}
</script>

<template>
  <span :class="[baseClasses, toneClasses[tone], sizeClasses[size]]">
    <slot />
  </span>
</template>
