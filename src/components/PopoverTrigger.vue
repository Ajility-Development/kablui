<script setup lang="ts">
import { computed, inject, onBeforeUnmount, type ComponentPublicInstance } from 'vue'
import { POPOVER_KEY } from './popoverContext'

/** No props — trigger content comes from the default slot. */
export type PopoverTriggerProps = Record<string, never>

const popover = inject(POPOVER_KEY, null)

if (!popover) {
  console.warn('[kablui] PopoverTrigger must be used inside Popover')
}

function setTriggerRef(el: Element | ComponentPublicInstance | null) {
  if (!popover) return
  popover.triggerRef.value = el instanceof HTMLElement ? el : null
}

onBeforeUnmount(() => {
  if (popover) popover.triggerRef.value = null
})

const isOpen = computed(() => !!popover?.open.value)

function onClick() {
  popover?.toggle('pointer')
}

function onKeydown(event: KeyboardEvent) {
  if (!popover) return

  switch (event.key) {
    case 'ArrowDown':
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!popover.open.value) popover.setOpen(true, 'keyboard')
      else if (event.key === 'Enter' || event.key === ' ') {
        popover.setOpen(false)
      }
      break
    case 'Escape':
      if (popover.open.value) {
        event.preventDefault()
        popover.setOpen(false)
      }
      break
  }
}

const classes = [
  'inline-flex items-center justify-center',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')
</script>

<template>
  <button
    :ref="setTriggerRef"
    type="button"
    data-slot="popover-trigger"
    :class="classes"
    aria-haspopup="dialog"
    :aria-expanded="isOpen ? 'true' : 'false'"
    :aria-controls="popover?.contentId"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
  </button>
</template>
