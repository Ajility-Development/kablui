<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { useId } from '../composables/useId'
import { ACCORDION_ITEM_KEY, ACCORDION_KEY } from './accordionContext'

export interface AccordionItemProps {
  /** Stable id used with Accordion `v-model` / open state. */
  value: string
  disabled?: boolean
}

const props = withDefaults(defineProps<AccordionItemProps>(), {
  disabled: false,
})

const accordion = inject(ACCORDION_KEY, null)

if (!accordion) {
  console.warn('[kablui] AccordionItem must be used inside Accordion')
}

const triggerId = useId('accordion-trigger')
const contentId = useId('accordion-content')

const isDisabled = computed(() => props.disabled)
const isOpen = computed(() => !!accordion?.isOpen(props.value))

function toggle() {
  if (!accordion || isDisabled.value) return
  accordion.toggle(props.value)
}

provide(ACCORDION_ITEM_KEY, {
  value: props.value,
  disabled: isDisabled,
  triggerId,
  contentId,
  isOpen,
  toggle,
})
</script>

<template>
  <div
    data-slot="accordion-item"
    :data-state="isOpen ? 'open' : 'closed'"
    :data-disabled="disabled || undefined"
    class="border-b border-kablui-border"
  >
    <slot />
  </div>
</template>
