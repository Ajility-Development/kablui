<script setup lang="ts">
import { computed, inject } from 'vue'
import { partTestId } from '../utils/testId'
import { ACCORDION_ITEM_KEY, ACCORDION_KEY } from './accordionContext'

/** No props — open state and ids come from AccordionItem. */
export type AccordionContentProps = Record<string, never>

const accordion = inject(ACCORDION_KEY, null)
const item = inject(ACCORDION_ITEM_KEY, null)

if (!item) {
  console.warn('[kablui] AccordionContent must be used inside AccordionItem')
}

const isOpen = computed(() => !!item?.isOpen.value)
const testId = computed(() =>
  partTestId(accordion?.testIdBase.value ?? 'accordion', 'content'),
)

const classes = ['px-1 py-3 text-kablui-md text-kablui-fg'].join(' ')
</script>

<template>
  <div
    v-show="isOpen"
    data-slot="accordion-content"
    :data-testid="testId"
    role="region"
    :id="item?.contentId"
    :aria-labelledby="item?.triggerId"
    :class="classes"
  >
    <slot />
  </div>
</template>
