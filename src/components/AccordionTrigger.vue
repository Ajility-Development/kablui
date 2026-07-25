<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch } from 'vue'
import { ACCORDION_ITEM_KEY, ACCORDION_KEY } from './accordionContext'

/** No props — label content comes from the default slot. */
export type AccordionTriggerProps = Record<string, never>

const accordion = inject(ACCORDION_KEY, null)
const item = inject(ACCORDION_ITEM_KEY, null)

if (!accordion || !item) {
  console.warn('[kablui] AccordionTrigger must be used inside AccordionItem')
}

const isOpen = computed(() => !!item?.isOpen.value)
const isDisabled = computed(() => !!item?.disabled.value)

let triggerEl: HTMLButtonElement | null = null

function setTriggerRef(el: Element | null) {
  triggerEl = el instanceof HTMLButtonElement ? el : null
  if (accordion && item) {
    accordion.registerTrigger(item.value, triggerEl, isDisabled.value)
  }
}

watch(isDisabled, (disabled) => {
  if (accordion && item) {
    accordion.registerTrigger(item.value, triggerEl, disabled)
  }
})

onBeforeUnmount(() => {
  if (accordion && item) accordion.unregisterTrigger(item.value)
})

function onClick() {
  item?.toggle()
}

function onKeydown(event: KeyboardEvent) {
  if (!accordion || !item || isDisabled.value) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      item.toggle()
      break
    case 'ArrowDown':
      event.preventDefault()
      accordion.focusRelative(item.value, 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      accordion.focusRelative(item.value, -1)
      break
  }
}

const classes = [
  'flex w-full items-center justify-between gap-2',
  'px-1 py-3 text-left text-kablui-md font-kablui-medium text-kablui-fg',
  'bg-transparent hover:bg-kablui-muted',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')
</script>

<template>
  <h3 class="m-0">
    <button
      :ref="setTriggerRef"
      type="button"
      data-slot="accordion-trigger"
      :id="item?.triggerId"
      :class="classes"
      :disabled="isDisabled"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="item?.contentId"
      @click="onClick"
      @keydown="onKeydown"
    >
      <slot />
    </button>
  </h3>
</template>
