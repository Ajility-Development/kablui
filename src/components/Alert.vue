<script setup lang="ts">
export interface AlertProps {
  tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
  title?: string
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

const toneClasses: Record<NonNullable<AlertProps['tone']>, string> = {
  neutral: 'border-kablui-border bg-kablui-muted text-kablui-fg',
  accent: 'border-kablui-accent bg-kablui-accent text-kablui-accent-fg',
  danger: 'border-kablui-danger bg-kablui-danger text-kablui-danger-fg',
  success: 'border-kablui-success bg-kablui-success text-kablui-success-fg',
  warning: 'border-kablui-warning bg-kablui-warning text-kablui-warning-fg',
}

const dismissClasses = [
  'ml-auto shrink-0 -mr-1 -mt-0.5 inline-flex size-6 items-center justify-center',
  'rounded-kablui-sm text-current opacity-70 hover:opacity-100',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')

function onDismiss() {
  emit('dismiss')
}
</script>

<template>
  <div
    :role="tone === 'danger' ? 'alert' : 'status'"
    :class="[baseClasses, toneClasses[tone]]"
  >
    <div class="min-w-0 flex-1">
      <div v-if="title" class="font-kablui-semibold">
        {{ title }}
      </div>
      <div :class="title ? 'mt-0.5' : undefined">
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      :class="dismissClasses"
      aria-label="Dismiss"
      @click="onDismiss"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</template>
