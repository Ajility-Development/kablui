<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { omitDataTestId, resolveTestId } from '../utils/testId'

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const attrs = useAttrs()
const testId = computed(() => resolveTestId(attrs, 'dismiss'))

const classes = [
  'inline-flex size-7 shrink-0 items-center justify-center',
  'rounded-kablui-sm text-current hover:bg-kablui-muted',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')

function onClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    v-bind="omitDataTestId(attrs)"
    :class="classes"
    :data-testid="testId"
    aria-label="Dismiss"
    @click="onClick"
  >
    <span aria-hidden="true">&times;</span>
  </button>
</template>
