<script setup lang="ts">
import type { Tone } from '../types/tone'
import { SURFACE_TONE_CLASSES } from '../utils/tones'
import DismissButton from './DismissButton.vue'

export interface AlertProps {
  tone?: Tone
  title?: string
  /** Shows a dismiss control and emits `dismiss` when activated. */
  dismissible?: boolean
}

withDefaults(defineProps<AlertProps>(), {
  tone: 'neutral',
  dismissible: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

const baseClasses = [
  'relative flex w-full gap-3 rounded-kablui-md border px-3 py-2.5',
  'text-kablui-md',
].join(' ')

function onDismiss() {
  emit('dismiss')
}
</script>

<template>
  <div
    :role="tone === 'danger' ? 'alert' : 'status'"
    :class="[baseClasses, SURFACE_TONE_CLASSES[tone]]"
  >
    <div class="min-w-0 flex-1">
      <div v-if="title" class="font-kablui-semibold">
        {{ title }}
      </div>
      <div :class="title ? 'mt-0.5' : undefined">
        <slot />
      </div>
    </div>
    <DismissButton
      v-if="dismissible"
      class="ml-auto -mr-1 -mt-0.5"
      @click="onDismiss"
    />
  </div>
</template>
