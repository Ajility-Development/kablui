<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useId } from '../composables/useId'
import { TABS_KEY, type TabRegistration } from './tabsContext'

export interface TabsProps {
  orientation?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<TabsProps>(), {
  orientation: 'horizontal',
})

const model = defineModel<string>()

const baseId = useId('tabs')
const tabs = ref<TabRegistration[]>([])

function getTabId(value: string) {
  return `${baseId}-tab-${value}`
}

function getPanelId(value: string) {
  return `${baseId}-panel-${value}`
}

function registerTab(tab: TabRegistration) {
  const next = [...tabs.value]
  const index = next.findIndex((t) => t.value === tab.value)
  if (index === -1) next.push(tab)
  else next[index] = tab
  tabs.value = next
}

function unregisterTab(value: string) {
  tabs.value = tabs.value.filter((t) => t.value !== value)
}

function updateTab(value: string, patch: Partial<Omit<TabRegistration, 'value'>>) {
  const next = [...tabs.value]
  const index = next.findIndex((t) => t.value === value)
  if (index === -1) return
  next[index] = { ...next[index]!, ...patch, value }
  tabs.value = next
}

function enabledTabs(): TabRegistration[] {
  return tabs.value.filter((t) => !t.disabled)
}

function isSelected(value: string) {
  return model.value === value
}

function isTabbable(value: string) {
  const tab = tabs.value.find((t) => t.value === value)
  if (!tab || tab.disabled) return false
  if (model.value != null) return model.value === value
  const first = enabledTabs()[0]
  return first?.value === value
}

function select(value: string) {
  const tab = tabs.value.find((t) => t.value === value)
  if (!tab || tab.disabled) return
  model.value = value
}

function focusTab(tab: TabRegistration) {
  model.value = tab.value
  tab.el.focus()
}

function focusRelative(currentValue: string, delta: number) {
  const list = enabledTabs()
  const index = list.findIndex((t) => t.value === currentValue)
  if (index === -1 || list.length === 0) return
  const next = list[(index + delta + list.length) % list.length]!
  focusTab(next)
}

function focusFirst() {
  const list = enabledTabs()
  if (list.length === 0) return
  focusTab(list[0]!)
}

function focusLast() {
  const list = enabledTabs()
  if (list.length === 0) return
  focusTab(list[list.length - 1]!)
}

provide(TABS_KEY, {
  model,
  orientation: computed(() => props.orientation),
  registerTab,
  unregisterTab,
  updateTab,
  getTabId,
  getPanelId,
  select,
  focusRelative,
  focusFirst,
  focusLast,
  isSelected,
  isTabbable,
})

const orientationClasses: Record<NonNullable<TabsProps['orientation']>, string> = {
  horizontal: 'flex-col',
  vertical: 'flex-row',
}
</script>

<template>
  <div
    data-slot="tabs"
    :class="['flex gap-0', orientationClasses[orientation]]"
    :data-orientation="orientation"
  >
    <slot />
  </div>
</template>
