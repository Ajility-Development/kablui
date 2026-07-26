<script setup lang="ts">
export interface CardProps {
  as?: 'div' | 'article' | 'section'
}

withDefaults(defineProps<CardProps>(), {
  as: 'div',
})

const baseClasses = [
  'rounded-kablui-md border border-kablui-border bg-kablui-bg',
  'text-kablui-fg shadow-kablui-sm',
].join(' ')
</script>

<template>
  <component
    :is="as"
    :class="baseClasses"
    data-slot="card"
    data-testid="card"
  >
    <slot />
  </component>
</template>
