<script setup lang="ts">
export type CardHeaderProps = Record<string, never>

const classes = 'flex flex-col gap-1 px-4 pt-4 pb-2 text-kablui-fg'
</script>

<template>
  <div
    :class="classes"
    data-slot="card-header"
  >
    <slot />
  </div>
</template>
