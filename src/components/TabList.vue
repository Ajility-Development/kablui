<script setup lang="ts">
import { computed, inject } from 'vue'
import { TABS_KEY } from './tabsContext'

const tabs = inject(TABS_KEY, null)

if (!tabs) {
  console.warn('[kablui] TabList must be used inside Tabs')
}

const orientation = computed(() => tabs?.orientation.value ?? 'horizontal')

const orientationClasses: Record<'horizontal' | 'vertical', string> = {
  horizontal: 'flex-row border-b border-kablui-border',
  vertical: 'flex-col border-r border-kablui-border',
}
</script>

<template>
  <div
    role="tablist"
    data-slot="tab-list"
    :aria-orientation="orientation"
    :class="['flex', orientationClasses[orientation]]"
  >
    <slot />
  </div>
</template>
