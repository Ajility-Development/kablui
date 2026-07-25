<script setup lang="ts">
export interface EmptyProps {
  title?: string
}

defineProps<EmptyProps>()

const rootClasses = [
  'flex w-full flex-col items-center justify-center gap-3',
  'px-4 py-8 text-center',
  'text-kablui-muted-fg',
].join(' ')
</script>

<template>
  <div :class="rootClasses">
    <div v-if="$slots.icon" class="text-kablui-muted-fg">
      <slot name="icon" />
    </div>
    <div v-if="title" class="text-kablui-lg font-kablui-semibold text-kablui-fg">
      {{ title }}
    </div>
    <div v-if="$slots.default" class="text-kablui-md max-w-sm">
      <slot />
    </div>
    <div v-if="$slots.action" class="mt-1">
      <slot name="action" />
    </div>
  </div>
</template>
