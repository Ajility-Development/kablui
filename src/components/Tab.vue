<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { TABS_KEY } from './tabsContext'

export interface TabProps {
  value: string
  disabled?: boolean
}

const props = withDefaults(defineProps<TabProps>(), {
  disabled: false,
})

const tabs = inject(TABS_KEY, null)
const buttonRef = ref<HTMLButtonElement | null>(null)

if (!tabs) {
  console.warn('[kablui] Tab must be used inside Tabs')
}

const isSelected = computed(() => !!tabs?.isSelected(props.value))
const tabId = computed(() => tabs?.getTabId(props.value))
const panelId = computed(() => tabs?.getPanelId(props.value))
const orientation = computed(() => tabs?.orientation.value ?? 'horizontal')
const tabindex = computed(() => (tabs?.isTabbable(props.value) ? 0 : -1))

onMounted(() => {
  if (!tabs || !buttonRef.value) return
  tabs.registerTab({
    value: props.value,
    disabled: props.disabled,
    el: buttonRef.value,
  })
})

onBeforeUnmount(() => {
  tabs?.unregisterTab(props.value)
})

watch(
  () => props.disabled,
  (disabled) => {
    tabs?.updateTab(props.value, { disabled })
  },
)

watch(buttonRef, (el) => {
  if (!tabs || !el) return
  tabs.updateTab(props.value, { el, disabled: props.disabled })
})

function onClick() {
  if (!tabs || props.disabled) return
  tabs.select(props.value)
  buttonRef.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (!tabs || props.disabled) return

  const horizontal = orientation.value === 'horizontal'
  const vertical = orientation.value === 'vertical'

  switch (event.key) {
    case 'ArrowRight':
      if (!horizontal) return
      event.preventDefault()
      tabs.focusRelative(props.value, 1)
      break
    case 'ArrowLeft':
      if (!horizontal) return
      event.preventDefault()
      tabs.focusRelative(props.value, -1)
      break
    case 'ArrowDown':
      if (!vertical) return
      event.preventDefault()
      tabs.focusRelative(props.value, 1)
      break
    case 'ArrowUp':
      if (!vertical) return
      event.preventDefault()
      tabs.focusRelative(props.value, -1)
      break
    case 'Home':
      event.preventDefault()
      tabs.focusFirst()
      break
    case 'End':
      event.preventDefault()
      tabs.focusLast()
      break
  }
}

const baseClasses = [
  'inline-flex items-center justify-center gap-1.5',
  'px-3 py-2 text-kablui-md font-kablui-medium',
  'text-kablui-muted-fg bg-transparent',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

const selectedClasses = computed(() => {
  if (!isSelected.value) {
    return orientation.value === 'horizontal'
      ? 'border-b-2 border-transparent hover:text-kablui-fg'
      : 'border-r-2 border-transparent hover:text-kablui-fg'
  }
  return orientation.value === 'horizontal'
    ? 'border-b-2 border-kablui-accent text-kablui-accent'
    : 'border-r-2 border-kablui-accent text-kablui-accent'
})
</script>

<template>
  <button
    ref="buttonRef"
    type="button"
    role="tab"
    data-slot="tab"
    :id="tabId"
    :disabled="disabled || undefined"
    :aria-selected="isSelected ? 'true' : 'false'"
    :aria-controls="panelId"
    :tabindex="tabindex"
    :class="[baseClasses, selectedClasses]"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
  </button>
</template>
