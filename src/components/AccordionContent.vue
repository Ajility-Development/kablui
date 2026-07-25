<script setup lang="ts">
import { computed, inject } from 'vue'
import { ACCORDION_ITEM_KEY } from './accordionContext'

const item = inject(ACCORDION_ITEM_KEY, null)

if (!item) {
  console.warn('[kablui] AccordionContent must be used inside AccordionItem')
}

const isOpen = computed(() => !!item?.isOpen.value)

const classes = [
  'px-1 pb-3 text-kablui-md text-kablui-muted-fg',
].join(' ')
</script>

<template>
  <div
    v-show="isOpen"
    data-slot="accordion-content"
    role="region"
    :id="item?.contentId"
    :aria-labelledby="item?.triggerId"
    :class="classes"
  >
    <slot />
  </div>
</template>
