<script setup lang="ts">
import { useId } from '../composables/useId'
import type { ToastTone } from './toastContext'

export interface ToastProps {
  tone?: ToastTone
  title: string
  description?: string
  actionLabel?: string
}

withDefaults(defineProps<ToastProps>(), {
  tone: 'neutral',
})

const emit = defineEmits<{
  dismiss: []
  action: []
}>()

const titleId = useId('toast-title')
const descriptionId = useId('toast-description')

const baseClasses = [
  'pointer-events-auto relative flex w-80 max-w-[calc(100vw-2rem)] gap-3',
  'rounded-kablui-md border px-3 py-2.5 shadow-kablui-md',
  'text-kablui-md',
].join(' ')

const toneClasses: Record<ToastTone, string> = {
  neutral: 'border-kablui-border bg-kablui-bg text-kablui-fg',
  accent: 'border-kablui-accent bg-kablui-accent text-kablui-accent-fg',
  danger: 'border-kablui-danger bg-kablui-danger text-kablui-danger-fg',
  success: 'border-kablui-success bg-kablui-success text-kablui-success-fg',
  warning: 'border-kablui-warning bg-kablui-warning text-kablui-warning-fg',
}

const dismissClasses = [
  'shrink-0 -mr-1 -mt-0.5 inline-flex size-6 items-center justify-center',
  'rounded-kablui-sm text-current opacity-70 hover:opacity-100',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')

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
    :role="tone === 'danger' ? 'alert' : 'status'"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
    :class="[baseClasses, toneClasses[tone]]"
    data-kablui-toast
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
        v-if="actionLabel"
        type="button"
        :class="actionClasses"
        @click="onAction"
      >
        {{ actionLabel }}
      </button>
    </div>
    <button
      type="button"
      :class="dismissClasses"
      aria-label="Dismiss"
      @click="onDismiss"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</template>
