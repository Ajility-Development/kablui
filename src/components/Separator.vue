<script setup lang="ts">
export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  /** When true, uses `role="separator"`; otherwise decorative (`aria-hidden`). */
  semantic?: boolean
}

withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'horizontal',
  semantic: false,
})

const baseClasses = 'shrink-0 border-0 border-solid'

const borderClasses: Record<'decorative' | 'semantic', string> = {
  decorative: 'border-kablui-border',
  semantic: 'border-kablui-border-strong',
}

const orientationClasses: Record<NonNullable<SeparatorProps['orientation']>, string> = {
  horizontal: 'w-full border-t',
  vertical: 'h-full border-l',
}
</script>

<template>
  <div
    :role="semantic ? 'separator' : undefined"
    :aria-hidden="semantic ? undefined : true"
    :aria-orientation="semantic && orientation === 'vertical' ? 'vertical' : undefined"
    :class="[
      baseClasses,
      borderClasses[semantic ? 'semantic' : 'decorative'],
      orientationClasses[orientation],
    ]"
  />
</template>
