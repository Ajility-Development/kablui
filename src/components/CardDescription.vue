<script setup lang="ts">
export type CardDescriptionProps = Record<string, never>

const classes = 'text-kablui-sm text-kablui-muted-fg'
</script>

<template>
  <p
    :class="classes"
    data-slot="card-description"
    data-testid="card-description"
  >
    <slot />
  </p>
</template>
