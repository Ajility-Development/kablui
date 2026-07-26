<script setup lang="ts">
export type CardContentProps = Record<string, never>

const classes = 'px-4 py-3 text-kablui-md text-kablui-fg'
</script>

<template>
  <div
    :class="classes"
    data-slot="card-content"
  >
    <slot />
  </div>
</template>
