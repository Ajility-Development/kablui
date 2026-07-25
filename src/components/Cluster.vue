<script setup lang="ts">
export interface ClusterProps {
  gap?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav' | 'ul' | 'ol' | 'form' | 'header' | 'footer'
}

withDefaults(defineProps<ClusterProps>(), {
  gap: 'md',
  align: 'center',
  justify: 'start',
  as: 'div',
})

const gapClasses: Record<NonNullable<ClusterProps['gap']>, string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

const alignClasses: Record<NonNullable<ClusterProps['align']>, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

const justifyClasses: Record<NonNullable<ClusterProps['justify']>, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}
</script>

<template>
  <component
    :is="as"
    :class="[
      'flex flex-wrap',
      gapClasses[gap],
      alignClasses[align],
      justifyClasses[justify],
    ]"
  >
    <slot />
  </component>
</template>
