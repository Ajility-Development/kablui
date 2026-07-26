<script setup lang="ts">
export interface CardTitleProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

withDefaults(defineProps<CardTitleProps>(), {
  as: 'h3',
})

const classes = 'font-kablui-semibold text-kablui-lg text-kablui-fg'
</script>

<template>
  <component
    :is="as"
    :class="classes"
    data-slot="card-title"
    data-testid="card-title"
  >
    <slot />
  </component>
</template>
