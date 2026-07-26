<script setup lang="ts">
export interface SkeletonProps {
  /** CSS width (e.g. `8rem` or `100%`). */
  width?: string
  /** CSS height (e.g. `1rem`). */
  height?: string
  /** Render as a circle (uses `height`/`width` for diameter). */
  circle?: boolean
  /** Pulse animation. Defaults to `true`. */
  animated?: boolean
}

withDefaults(defineProps<SkeletonProps>(), {
  circle: false,
  animated: true,
})

const baseClasses = 'block bg-kablui-muted'

const shapeClasses: Record<'rect' | 'circle', string> = {
  rect: 'rounded-kablui-md',
  circle: 'rounded-kablui-full',
}
</script>

<template>
  <div
    aria-hidden="true"
    data-testid="skeleton"
    :class="[
      baseClasses,
      shapeClasses[circle ? 'circle' : 'rect'],
      animated ? 'animate-pulse' : undefined,
    ]"
    :style="{
      width: width ?? (circle ? '2.5rem' : '100%'),
      height: height ?? (circle ? '2.5rem' : '1rem'),
    }"
  />
</template>
