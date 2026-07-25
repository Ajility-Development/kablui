<script setup lang="ts">
export interface ContainerProps {
  size?: 'sm' | 'md' | 'lg'
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer'
}

withDefaults(defineProps<ContainerProps>(), {
  size: 'md',
  as: 'div',
})

const sizeClasses: Record<NonNullable<ContainerProps['size']>, string> = {
  sm: 'max-w-screen-sm px-4',
  md: 'max-w-screen-md px-4',
  lg: 'max-w-screen-lg px-6',
}
</script>

<template>
  <component
    :is="as"
    :class="['mx-auto w-full', sizeClasses[size]]"
  >
    <slot />
  </component>
</template>
