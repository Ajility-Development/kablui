<script setup lang="ts">
import { computed, nextTick, provide, ref, watch } from 'vue'
import type { FloatingPlacement } from '../composables/useFloating'
import { useDismissible } from '../composables/useDismissible'
import { useId } from '../composables/useId'
import { useOverlayStack } from '../composables/useOverlayStack'
import type { OpenReason } from '../types/overlay'
import { MENU_KEY } from './menuContext'

export interface MenuProps {
  /** Floating placement relative to the trigger. */
  placement?: FloatingPlacement
}

const props = withDefaults(defineProps<MenuProps>(), {
  placement: 'bottom-start',
})

const open = defineModel<boolean>('open', { default: false })

const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const contentId = useId('menu')
const previouslyFocused = ref<HTMLElement | null>(null)

const { register, unregister } = useOverlayStack('menu')

function getEnabledItems(): HTMLElement[] {
  const content = contentRef.value
  if (!content) return []
  return [
    ...content.querySelectorAll<HTMLElement>(
      '[data-slot="menu-item"]:not([disabled]):not([aria-disabled="true"])',
    ),
  ]
}

function focusFirstItem() {
  getEnabledItems()[0]?.focus()
}

function focusItemRelative(current: HTMLElement | null, delta: number) {
  const items = getEnabledItems()
  if (items.length === 0) return

  const index = current ? items.indexOf(current) : -1
  const nextIndex =
    index === -1
      ? delta > 0
        ? 0
        : items.length - 1
      : (index + delta + items.length) % items.length
  items[nextIndex]?.focus()
}

function focusItemAtEdge(edge: 'start' | 'end') {
  const items = getEnabledItems()
  if (items.length === 0) return
  ;(edge === 'start' ? items[0] : items[items.length - 1])?.focus()
}

function setOpen(value: boolean, _reason?: OpenReason) {
  open.value = value
}

function toggle(reason?: OpenReason) {
  setOpen(!open.value, reason)
}

function closeOnSelect() {
  open.value = false
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
        focusFirstItem()
      })
      return
    }

    unregister()
    // Avoid stealing focus when mounting closed.
    if (wasOpen) {
      nextTick(() => {
        const restore = previouslyFocused.value ?? triggerRef.value
        restore?.focus()
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

provide(MENU_KEY, {
  open,
  contentId,
  placement: computed(() => props.placement),
  triggerRef,
  contentRef,
  setOpen,
  toggle,
  getEnabledItems,
  focusFirstItem,
  focusItemRelative,
  focusItemAtEdge,
  closeOnSelect,
})
</script>

<template>
  <div ref="rootRef" class="relative inline-flex" data-slot="menu" data-testid="menu">
    <slot />
  </div>
</template>
