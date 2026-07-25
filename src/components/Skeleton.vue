<script setup lang="ts">
export interface SkeletonProps {
  width?: string
  height?: string
  circle?: boolean
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
