<script setup lang="ts">
import { computed, inject, onBeforeUnmount, type ComponentPublicInstance } from 'vue'
import {
  base,
  sizeClasses,
  variantClasses,
  type ButtonSize,
  type ButtonVariant,
} from '../utils/buttonClasses'
import { MENU_KEY } from './menuContext'

export interface MenuTriggerProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

const props = withDefaults(defineProps<MenuTriggerProps>(), {
  variant: 'outline',
  size: 'md',
})

const menu = inject(MENU_KEY, null)

if (!menu) {
  console.warn('[kablui] MenuTrigger must be used inside Menu')
}

function setTriggerRef(el: Element | ComponentPublicInstance | null) {
  if (!menu) return
  menu.triggerRef.value = el instanceof HTMLElement ? el : null
}

onBeforeUnmount(() => {
  if (menu) menu.triggerRef.value = null
})

const isOpen = computed(() => !!menu?.open.value)

function onClick() {
  menu?.toggle('pointer')
}

function onKeydown(event: KeyboardEvent) {
  if (!menu) return

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!menu.open.value) {
        menu.setOpen(true, 'keyboard')
      } else if (event.key === 'Enter' || event.key === ' ') {
        menu.setOpen(false)
      } else if (event.key === 'ArrowDown') {
        menu.focusFirstItem()
      } else if (event.key === 'ArrowUp') {
        menu.focusItemAtEdge('end')
      }
      break
    case 'Escape':
      if (menu.open.value) {
        event.preventDefault()
        menu.setOpen(false)
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
    data-slot="menu-trigger"
    data-testid="menu-trigger"
    :class="classes"
    aria-haspopup="menu"
    :aria-expanded="isOpen ? 'true' : 'false'"
    :aria-controls="menu?.contentId"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
  </button>
</template>
