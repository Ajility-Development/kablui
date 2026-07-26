<script setup lang="ts">
import { computed, nextTick, provide, ref, watch } from 'vue'
import type { FloatingPlacement } from '../composables/useFloating'
import { useDismissible } from '../composables/useDismissible'
import { useId } from '../composables/useId'
import { useOverlayStack } from '../composables/useOverlayStack'
import type { OpenReason } from '../types/overlay'
import { POPOVER_KEY } from './popoverContext'

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

const { register, unregister } = useOverlayStack('menu')

function setOpen(value: boolean, reason?: OpenReason) {
  if (value) {
    openedByKeyboard.value = reason === 'keyboard'
  }
  open.value = value
}

function toggle(reason?: OpenReason) {
  setOpen(!open.value, reason)
}

function dismiss() {
  open.value = false
}

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

// Call after useOverlayStack so Escape ownership uses `isTop`.
useDismissible(rootRef, {
  active: open,
  onDismiss: dismiss,
  escape: true,
  outside: true,
})

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
