<script setup lang="ts">
import { computed } from 'vue'

export interface ProgressProps {
  /** Current value. Omit (or set `indeterminate`) for an indeterminate bar. */
  value?: number
  max?: number
  /** Force indeterminate mode even when `value` is set. */
  indeterminate?: boolean
  /** Accessible name for the progressbar (not shown visually). */
  label?: string
  /** Visible caption above the bar. Used for `aria-label` when `label` is omitted. */
  caption?: string
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

const ariaLabel = computed(() => props.label ?? props.caption)

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
  'kablui-progress-indeterminate',
].join(' ')
</script>

<template>
  <div class="flex w-full flex-col gap-1">
    <div
      v-if="caption"
      class="text-kablui-sm text-kablui-muted-fg"
    >
      {{ caption }}
    </div>
    <div
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-valuenow="isIndeterminate ? undefined : clampedValue"
      :aria-label="ariaLabel || undefined"
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

<style scoped>
@keyframes kablui-progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(350%);
  }
}

.kablui-progress-indeterminate {
  animation: kablui-progress-indeterminate 1.2s ease-in-out infinite;
}
</style>
