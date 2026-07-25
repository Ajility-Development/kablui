<script setup lang="ts">
export interface StackProps {
  gap?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav' | 'ul' | 'ol' | 'form' | 'header' | 'footer'
}

withDefaults(defineProps<StackProps>(), {
  gap: 'md',
  align: 'stretch',
  as: 'div',
})

const gapClasses: Record<NonNullable<StackProps['gap']>, string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

const alignClasses: Record<NonNullable<StackProps['align']>, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}
</script>

<template>
  <component
    :is="as"
    :class="['flex flex-col', gapClasses[gap], alignClasses[align]]"
  >
    <slot />
  </component>
</template>
