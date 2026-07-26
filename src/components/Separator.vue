<script setup lang="ts">
export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  /**
   * When true (default), decorative: `aria-hidden`, no role, softer border.
   * When false, semantic: `role="separator"` and stronger border.
   */
  decorative?: boolean
}

withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'horizontal',
  decorative: true,
})

const baseClasses = 'shrink-0 border-0 border-solid'

const borderClasses: Record<'decorative' | 'emphasized', string> = {
  decorative: 'border-kablui-border',
  emphasized: 'border-kablui-border-strong',
}

const orientationClasses: Record<NonNullable<SeparatorProps['orientation']>, string> = {
  horizontal: 'w-full border-t',
  vertical: 'h-full border-l',
}
</script>

<template>
  <div
    :role="decorative ? undefined : 'separator'"
    :aria-hidden="decorative ? true : undefined"
    :aria-orientation="!decorative && orientation === 'vertical' ? 'vertical' : undefined"
    :class="[
      baseClasses,
      borderClasses[decorative ? 'decorative' : 'emphasized'],
      orientationClasses[orientation],
    ]"
  />
</template>
