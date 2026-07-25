<script setup lang="ts">
import { computed } from 'vue'

export interface ProgressProps {
  value?: number
  max?: number
  indeterminate?: boolean
  label?: string
}

const props = withDefaults(defineProps<ProgressProps>(), {
  max: 100,
  indeterminate: false,
})

const isIndeterminate = computed(
  () => props.indeterminate || props.value === undefined,
)

const clampedValue = computed(() => {
  if (props.value === undefined) return undefined
  const max = props.max > 0 ? props.max : 100
  return Math.min(Math.max(props.value, 0), max)
})

const percent = computed(() => {
  if (clampedValue.value === undefined) return 0
  const max = props.max > 0 ? props.max : 100
  return (clampedValue.value / max) * 100
})

const trackClasses = [
  'relative h-2 w-full overflow-hidden rounded-kablui-full',
  'bg-kablui-muted',
].join(' ')

const barClasses = [
  'h-full rounded-kablui-full bg-kablui-accent',
  'transition-[width] duration-200 ease-out',
].join(' ')

const indeterminateClasses = [
  'absolute inset-y-0 w-1/3 rounded-kablui-full bg-kablui-accent',
  'animate-pulse',
].join(' ')
</script>

<template>
  <div class="flex w-full flex-col gap-1">
    <div
      v-if="label"
      class="text-kablui-sm text-kablui-muted-fg"
    >
      {{ label }}
    </div>
    <div
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-valuenow="isIndeterminate ? undefined : clampedValue"
      :aria-label="label || undefined"
      :aria-busy="isIndeterminate ? true : undefined"
      :class="trackClasses"
    >
      <div
        v-if="isIndeterminate"
        :class="indeterminateClasses"
      />
      <div
        v-else
        :class="barClasses"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
