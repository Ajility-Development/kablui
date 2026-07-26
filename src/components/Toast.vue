<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useId } from '../composables/useId'
import type { Tone } from '../types/tone'
import { omitDataTestId, partTestId, resolveTestId } from '../utils/testId'
import { SURFACE_TONE_CLASSES } from '../utils/tones'
import DismissButton from './DismissButton.vue'

export interface ToastActionProp {
  label: string
}

export interface ToastProps {
  tone?: Tone
  title: string
  description?: string
  /** Presentational action; click emits `action` (provider wires `onClick`). */
  action?: ToastActionProp
  /** When true, plays the leave (fade-out) styles before the provider removes the toast. */
  exiting?: boolean
}

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<ToastProps>(), {
  tone: 'neutral',
  exiting: false,
})

const emit = defineEmits<{
  dismiss: []
  action: []
}>()

const attrs = useAttrs()
const testIdBase = computed(() => resolveTestId(attrs, 'toast'))

const titleId = useId('toast-title')
const descriptionId = useId('toast-description')

const baseClasses = [
  'pointer-events-auto relative flex w-80 max-w-[calc(100vw-2rem)] gap-3',
  'rounded-kablui-md border px-3 py-2.5 shadow-kablui-md',
  'text-kablui-md',
  'transition-[opacity,transform] duration-200 ease-out',
].join(' ')

const exitingClasses = 'pointer-events-none opacity-0 translate-y-1'

const actionClasses = [
  'mt-1.5 inline-flex items-center text-kablui-sm font-kablui-medium',
  'underline underline-offset-2 opacity-90 hover:opacity-100',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')

function onDismiss() {
  emit('dismiss')
}

function onAction() {
  emit('action')
}
</script>

<template>
  <div
    v-bind="omitDataTestId(attrs)"
    :role="tone === 'danger' ? 'alert' : 'status'"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
    :class="[baseClasses, SURFACE_TONE_CLASSES[tone], exiting ? exitingClasses : undefined]"
    :data-testid="testIdBase"
    data-kablui-toast
    :data-exiting="exiting ? '' : undefined"
  >
    <div class="min-w-0 flex-1">
      <div
        :id="titleId"
        class="font-kablui-semibold"
      >
        {{ title }}
      </div>
      <div
        v-if="description"
        :id="descriptionId"
        class="mt-0.5 text-kablui-sm opacity-90"
      >
        {{ description }}
      </div>
      <button
        v-if="action"
        type="button"
        :class="actionClasses"
        @click="onAction"
      >
        {{ action.label }}
      </button>
    </div>
    <DismissButton
      class="-mr-1 -mt-0.5"
      :data-testid="partTestId(testIdBase, 'dismiss')"
      @click="onDismiss"
    />
  </div>
</template>
