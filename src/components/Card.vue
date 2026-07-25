<script setup lang="ts">
export interface CardProps {
  as?: 'div' | 'article' | 'section'
  padding?: 'none' | 'sm' | 'md'
}

withDefaults(defineProps<CardProps>(), {
  as: 'div',
  padding: 'none',
})

const baseClasses = [
  'rounded-kablui-md border border-kablui-border bg-kablui-bg',
  'text-kablui-fg shadow-kablui-sm',
].join(' ')

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
}
</script>

<template>
  <component
    :is="as"
    :class="[baseClasses, paddingClasses[padding]]"
    data-slot="card"
  >
    <slot />
  </component>
</template>
