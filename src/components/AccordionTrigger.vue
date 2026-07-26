<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch, type ComponentPublicInstance } from 'vue'
import { partTestId } from '../utils/testId'
import { ACCORDION_ITEM_KEY, ACCORDION_KEY } from './accordionContext'

export type AccordionHeading = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface AccordionTriggerProps {
  /** Heading level wrapping the trigger button. */
  heading?: AccordionHeading
}

withDefaults(defineProps<AccordionTriggerProps>(), {
  heading: 'h3',
})

const accordion = inject(ACCORDION_KEY, null)
const item = inject(ACCORDION_ITEM_KEY, null)

if (!accordion || !item) {
  console.warn('[kablui] AccordionTrigger must be used inside AccordionItem')
}

const isOpen = computed(() => !!item?.isOpen.value)
const isDisabled = computed(() => !!item?.disabled.value)
const itemValue = computed(() => item?.value.value ?? '')
const testId = computed(() =>
  partTestId(accordion?.testIdBase.value ?? 'accordion', 'trigger'),
)

let triggerEl: HTMLButtonElement | null = null

function setTriggerRef(el: Element | ComponentPublicInstance | null) {
  triggerEl = el instanceof HTMLButtonElement ? el : null
  if (accordion && item) {
    accordion.registerTrigger(itemValue.value, triggerEl, isDisabled.value)
  }
}

watch(itemValue, (value, previous) => {
  if (!accordion) return
  if (previous && previous !== value) accordion.unregisterTrigger(previous)
  accordion.registerTrigger(value, triggerEl, isDisabled.value)
})

watch(isDisabled, (disabled) => {
  if (accordion) accordion.registerTrigger(itemValue.value, triggerEl, disabled)
})

onBeforeUnmount(() => {
  if (accordion) accordion.unregisterTrigger(itemValue.value)
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
      accordion.focusRelative(itemValue.value, 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      accordion.focusRelative(itemValue.value, -1)
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

const chevronClasses = computed(() =>
  ['size-4 shrink-0 text-kablui-muted-fg transition-transform', isOpen.value ? 'rotate-180' : ''].join(
    ' ',
  ),
)
</script>

<template>
  <component :is="heading" class="m-0">
    <button
      :ref="setTriggerRef"
      type="button"
      data-slot="accordion-trigger"
      :data-testid="testId"
      :id="item?.triggerId"
      :class="classes"
      :disabled="isDisabled"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="item?.contentId"
      @click="onClick"
      @keydown="onKeydown"
    >
      <span class="min-w-0 flex-1">
        <slot />
      </span>
      <svg
        :class="chevronClasses"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  </component>
</template>
