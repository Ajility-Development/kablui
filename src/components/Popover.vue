<script setup lang="ts">
import { computed, nextTick, provide, ref, watch } from 'vue'
import type { FloatingPlacement } from '../composables/useFloating'
import { useDismissable } from '../composables/useDismissable'
import { useId } from '../composables/useId'
import { useOverlayStack } from '../composables/useOverlayStack'
import { POPOVER_KEY, type PopoverOpenReason } from './popoverContext'

export interface PopoverProps {
  /** Floating placement relative to the trigger. */
  placement?: FloatingPlacement
}

const props = withDefaults(defineProps<PopoverProps>(), {
  placement: 'bottom-start',
})

const open = defineModel<boolean>('open', { default: false })

const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const contentId = useId('popover')
const openedByKeyboard = ref(false)
const previouslyFocused = ref<HTMLElement | null>(null)

const { register, unregister } = useOverlayStack('dropdown')

function setOpen(value: boolean, reason?: PopoverOpenReason) {
  if (value) {
    openedByKeyboard.value = reason === 'keyboard'
  }
  open.value = value
}

function toggle(reason?: PopoverOpenReason) {
  setOpen(!open.value, reason)
}

function dismiss() {
  open.value = false
}

useDismissable(rootRef, {
  active: open,
  onDismiss: dismiss,
  escape: true,
  outside: true,
})

watch(
  open,
  (isOpen, wasOpen) => {
    if (isOpen) {
      register()
      previouslyFocused.value =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      nextTick(() => {
        if (openedByKeyboard.value) {
          contentRef.value?.focus()
        }
      })
      return
    }

    unregister()
    // Avoid stealing focus when mounting closed.
    if (wasOpen) {
      nextTick(() => {
        const restore = previouslyFocused.value ?? triggerRef.value
        restore?.focus()
        openedByKeyboard.value = false
        previouslyFocused.value = null
      })
    }
  },
  { immediate: true },
)

provide(POPOVER_KEY, {
  open,
  contentId,
  placement: computed(() => props.placement),
  triggerRef,
  contentRef,
  setOpen,
  toggle,
})
</script>

<template>
  <div ref="rootRef" class="relative inline-flex" data-slot="popover">
    <slot />
  </div>
</template>
