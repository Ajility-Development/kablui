<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import { useFloating } from '../composables/useFloating'
import { MENU_KEY } from './menuContext'

/** No props — placement and open state come from Menu. */
export type MenuContentProps = Record<string, never>

const menu = inject(MENU_KEY, null)

if (!menu) {
  console.warn('[kablui] MenuContent must be used inside Menu')
}

const fallbackTrigger = ref<HTMLElement | null>(null)
const fallbackContent = ref<HTMLElement | null>(null)

function setContentRef(el: Element | null) {
  if (!menu) return
  menu.contentRef.value = el instanceof HTMLElement ? el : null
}

onBeforeUnmount(() => {
  if (menu) menu.contentRef.value = null
})

const open = computed(() => !!menu?.open.value)
const placement = computed(() => menu?.placement.value ?? 'bottom-start')

const { style } = useFloating(
  menu?.triggerRef ?? fallbackTrigger,
  menu?.contentRef ?? fallbackContent,
  {
    open,
    placement,
  },
)

function onKeydown(event: KeyboardEvent) {
  if (!menu) return

  const current =
    document.activeElement instanceof HTMLElement ? document.activeElement : null

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      menu.focusItemRelative(current, 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      menu.focusItemRelative(current, -1)
      break
    case 'Home':
      event.preventDefault()
      menu.focusItemAtEdge('start')
      break
    case 'End':
      event.preventDefault()
      menu.focusItemAtEdge('end')
      break
  }
}

const classes = [
  'z-kablui-dropdown min-w-40 rounded-kablui-md border border-kablui-border bg-kablui-bg',
  'py-1 text-kablui-md text-kablui-fg shadow-kablui-md',
  'focus:outline-none',
].join(' ')
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && menu"
      :id="menu.contentId"
      :ref="setContentRef"
      role="menu"
      tabindex="-1"
      data-slot="menu-content"
      :data-placement="placement"
      :class="classes"
      :style="style"
      @pointerdown.stop
      @keydown="onKeydown"
    >
      <slot />
    </div>
  </Teleport>
</template>
