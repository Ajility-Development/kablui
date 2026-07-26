<script setup lang="ts">
import { computed, inject } from 'vue'
import { partTestId } from '../utils/testId'
import { TABS_KEY } from './tabsContext'

/** No props — orientation comes from Tabs. */
export type TabListProps = Record<string, never>

const tabs = inject(TABS_KEY, null)

if (!tabs) {
  console.warn('[kablui] TabList must be used inside Tabs')
}

const orientation = computed(() => tabs?.orientation.value ?? 'horizontal')
const testId = computed(() => partTestId(tabs?.testIdBase.value ?? 'tabs', 'tab-list'))

const orientationClasses: Record<'horizontal' | 'vertical', string> = {
  horizontal: 'flex-row border-b border-kablui-border',
  vertical: 'flex-col border-r border-kablui-border',
}
</script>

<template>
  <div
    role="tablist"
    data-slot="tab-list"
    :data-testid="testId"
    :aria-orientation="orientation"
    :class="['flex', orientationClasses[orientation]]"
  >
    <slot />
  </div>
</template>
