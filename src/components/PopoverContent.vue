<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, useAttrs, type ComponentPublicInstance } from 'vue'
import { useFloating } from '../composables/useFloating'
import { POPOVER_KEY } from './popoverContext'

/** No props — placement and open state come from Popover. */
export type PopoverContentProps = Record<string, never>

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const popover = inject(POPOVER_KEY, null)

if (!popover) {
  console.warn('[kablui] PopoverContent must be used inside Popover')
}

const fallbackTrigger = ref<HTMLElement | null>(null)
const fallbackContent = ref<HTMLElement | null>(null)

function setContentRef(el: Element | ComponentPublicInstance | null) {
  if (!popover) return
  popover.contentRef.value = el instanceof HTMLElement ? el : null
}

onBeforeUnmount(() => {
  if (popover) popover.contentRef.value = null
})

const open = computed(() => !!popover?.open.value)
const placement = computed(() => popover?.placement.value ?? 'bottom-start')

const { style } = useFloating(
  popover?.triggerRef ?? fallbackTrigger,
  popover?.contentRef ?? fallbackContent,
  {
    open,
    placement,
  },
)

const classes = [
  'z-kablui-dropdown rounded-kablui-md border border-kablui-border bg-kablui-bg',
  'p-3 text-kablui-md text-kablui-fg shadow-kablui-md',
  'focus:outline-none',
].join(' ')
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && popover"
      :id="popover.contentId"
      :ref="setContentRef"
      role="dialog"
      tabindex="-1"
      data-slot="popover-content"
      :data-placement="placement"
      :class="classes"
      :style="style"
      v-bind="attrs"
      @pointerdown.stop
    >
      <slot />
    </div>
  </Teleport>
</template>
