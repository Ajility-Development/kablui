<script setup lang="ts">
import { computed, inject } from 'vue'
import { TABS_KEY } from './tabsContext'

export interface TabPanelProps {
  value: string
}

const props = defineProps<TabPanelProps>()

const tabs = inject(TABS_KEY, null)

if (!tabs) {
  console.warn('[kablui] TabPanel must be used inside Tabs')
}

const isSelected = computed(() => !!tabs?.isSelected(props.value))
const panelId = computed(() => tabs?.getPanelId(props.value))
const tabId = computed(() => tabs?.getTabId(props.value))
</script>

<template>
  <div
    role="tabpanel"
    data-slot="tab-panel"
    :id="panelId"
    :aria-labelledby="tabId"
    :hidden="!isSelected"
    :tabindex="isSelected ? 0 : undefined"
    class="px-1 py-3 text-kablui-md text-kablui-fg"
  >
    <slot />
  </div>
</template>
