<script setup lang="ts">
export type CardFooterProps = Record<string, never>

const classes = [
  'flex flex-wrap items-center justify-end gap-2',
  'border-t border-kablui-border px-4 py-3',
].join(' ')
</script>

<template>
  <div
    :class="classes"
    data-slot="card-footer"
  >
    <slot />
  </div>
</template>
