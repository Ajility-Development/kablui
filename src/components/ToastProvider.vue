<script setup lang="ts">
import { computed, onScopeDispose, provide, ref } from 'vue'
import { useId } from '../composables/useId'
import { useOverlayStack } from '../composables/useOverlayStack'
import Stack from './Stack.vue'
import Toast from './Toast.vue'
import {
  TOAST_KEY,
  type ToastItem,
  type ToastOptions,
  type ToastPlacement,
} from './toastContext'

export interface ToastProviderProps {
  /** Corner placement for the toast region. Defaults to `bottom-end`. */
  placement?: ToastPlacement
  /** Max simultaneously visible toasts; excess wait in a queue. Defaults to `3`. */
  maxVisible?: number
  /** Teleport target. Defaults to `body`. */
  to?: string | HTMLElement
}

const props = withDefaults(defineProps<ToastProviderProps>(), {
  placement: 'bottom-end',
  maxVisible: 3,
  to: 'body',
})

defineSlots<{
  default?: () => unknown
}>()

const DEFAULT_DURATION = 5000

const visible = ref<ToastItem[]>([])
const pending = ref<ToastItem[]>([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()

// Use stack z-index; do not register — toasts must not steal Escape from dialogs.
const { zIndex } = useOverlayStack('toast')

const hasVisible = computed(() => visible.value.length > 0)

function clearTimer(id: string) {
  const handle = timers.get(id)
  if (handle !== undefined) {
    clearTimeout(handle)
    timers.delete(id)
  }
}

function scheduleDismiss(item: ToastItem) {
  if (item.duration <= 0) return
  clearTimer(item.id)
  const handle = setTimeout(() => {
    dismiss(item.id)
  }, item.duration)
  timers.set(item.id, handle)
}

function promote() {
  while (visible.value.length < props.maxVisible && pending.value.length > 0) {
    const next = pending.value.shift()
    if (!next) break
    visible.value.push(next)
    scheduleDismiss(next)
  }
}

function toast(options: ToastOptions): string {
  const item: ToastItem = {
    id: useId('toast'),
    tone: options.tone ?? 'neutral',
    title: options.title,
    description: options.description,
    duration: options.duration ?? DEFAULT_DURATION,
    action: options.action,
  }

  if (visible.value.length < props.maxVisible) {
    visible.value.push(item)
    scheduleDismiss(item)
  } else {
    pending.value.push(item)
  }

  return item.id
}

function dismiss(id: string) {
  clearTimer(id)

  const visibleIndex = visible.value.findIndex((item) => item.id === id)
  if (visibleIndex !== -1) {
    visible.value.splice(visibleIndex, 1)
    promote()
    return
  }

  const pendingIndex = pending.value.findIndex((item) => item.id === id)
  if (pendingIndex !== -1) {
    pending.value.splice(pendingIndex, 1)
  }
}

function onAction(item: ToastItem) {
  item.action?.onClick()
}

provide(TOAST_KEY, { toast, dismiss })

onScopeDispose(() => {
  for (const id of [...timers.keys()]) clearTimer(id)
})

const placementClasses: Record<ToastPlacement, string> = {
  'top-start': 'top-4 left-4',
  'top-end': 'top-4 right-4',
  'bottom-start': 'bottom-4 left-4',
  'bottom-end': 'bottom-4 right-4',
}

const isTopPlacement = computed(() => props.placement.startsWith('top'))

const regionClasses = computed(() =>
  ['pointer-events-none fixed z-kablui-toast', placementClasses[props.placement]].join(' '),
)

/** Newest closest to the corner edge. */
const orderedVisible = computed(() =>
  isTopPlacement.value ? [...visible.value].reverse() : visible.value,
)
</script>

<template>
  <slot />
  <Teleport :to="to">
    <div
      v-if="hasVisible"
      :class="regionClasses"
      :style="{ zIndex }"
      data-kablui-toast-region
      :data-placement="placement"
    >
      <Stack
        gap="sm"
        :align="placement.endsWith('end') ? 'end' : 'start'"
      >
        <Toast
          v-for="item in orderedVisible"
          :key="item.id"
          :tone="item.tone"
          :title="item.title"
          :description="item.description"
          :action-label="item.action?.label"
          @dismiss="dismiss(item.id)"
          @action="onAction(item)"
        />
      </Stack>
    </div>
  </Teleport>
</template>
