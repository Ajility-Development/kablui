<script setup lang="ts">
import { computed, inject, onBeforeUnmount, type ComponentPublicInstance } from 'vue'
import {
  base,
  sizeClasses,
  variantClasses,
  type ButtonSize,
  type ButtonVariant,
} from '../utils/buttonClasses'
import { POPOVER_KEY } from './popoverContext'

export interface PopoverTriggerProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

const props = withDefaults(defineProps<PopoverTriggerProps>(), {
  variant: 'outline',
  size: 'md',
})

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

const classes = computed(() => [base, variantClasses[props.variant], sizeClasses[props.size]])
</script>

<template>
  <button
    :ref="setTriggerRef"
    type="button"
    data-slot="popover-trigger"
    data-testid="popover-trigger"
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
