<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import {
  useFloating,
  type FloatingPlacement,
} from '../composables/useFloating'
import { useId } from '../composables/useId'
import { omitDataTestId, partTestId, resolveTestId } from '../utils/testId'

export interface TooltipProps {
  /** Tooltip text when the default slot for content is unused. */
  content?: string
  placement?: FloatingPlacement
  /** Delay in ms before showing on hover/focus. */
  delay?: number
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'top',
  delay: 300,
})

const attrs = useAttrs()
const testIdBase = computed(() => resolveTestId(attrs, 'tooltip'))

const open = ref(false)
const anchorRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const tooltipId = useId('tooltip')

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let describedEl: HTMLElement | null = null
let describedByObserver: MutationObserver | null = null

const { style } = useFloating(anchorRef, floatingRef, {
  open,
  placement: () => props.placement,
})

function clearTimers() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function canUseHover(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true
  }
  return window.matchMedia('(hover: hover)').matches
}

function resolveDescribedEl(): HTMLElement | null {
  const root = anchorRef.value
  if (!root) return null
  const focusable = root.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  return focusable ?? root
}

function parseDescribedByTokens(value: string | null): string[] {
  if (!value) return []
  return value.split(/\s+/).filter(Boolean)
}

function addDescribedByToken(el: HTMLElement, id: string) {
  const tokens = parseDescribedByTokens(el.getAttribute('aria-describedby'))
  if (tokens.includes(id)) return
  tokens.push(id)
  el.setAttribute('aria-describedby', tokens.join(' '))
}

function removeDescribedByToken(el: HTMLElement, id: string) {
  const tokens = parseDescribedByTokens(el.getAttribute('aria-describedby')).filter(
    (token) => token !== id,
  )
  if (tokens.length === 0) {
    el.removeAttribute('aria-describedby')
  } else {
    el.setAttribute('aria-describedby', tokens.join(' '))
  }
}

function stopDescribedByObserver() {
  describedByObserver?.disconnect()
  describedByObserver = null
}

function startDescribedByObserver(el: HTMLElement) {
  stopDescribedByObserver()
  if (typeof MutationObserver === 'undefined') return
  describedByObserver = new MutationObserver(() => {
    if (!open.value || describedEl !== el) return
    addDescribedByToken(el, tooltipId)
  })
  describedByObserver.observe(el, {
    attributes: true,
    attributeFilter: ['aria-describedby'],
  })
}

function clearDescribedBy(el: HTMLElement | null) {
  if (!el) return
  stopDescribedByObserver()
  removeDescribedByToken(el, tooltipId)
}

function syncDescribedBy(isOpen: boolean) {
  const el = resolveDescribedEl()
  if (describedEl && describedEl !== el) {
    clearDescribedBy(describedEl)
    describedEl = null
  }
  if (!el) return
  describedEl = el
  if (isOpen) {
    addDescribedByToken(el, tooltipId)
    startDescribedByObserver(el)
  } else {
    clearDescribedBy(el)
  }
}

function scheduleShow() {
  clearTimers()
  showTimer = setTimeout(() => {
    showTimer = null
    open.value = true
  }, props.delay)
}

function scheduleHide() {
  clearTimers()
  hideTimer = setTimeout(() => {
    hideTimer = null
    open.value = false
  }, 0)
}

function onPointerEnter() {
  if (!canUseHover()) return
  scheduleShow()
}

function onPointerLeave() {
  if (!canUseHover()) return
  scheduleHide()
}

function onFocusIn() {
  scheduleShow()
}

function onFocusOut(event: FocusEvent) {
  const root = anchorRef.value
  const next = event.relatedTarget
  if (root && next instanceof Node && root.contains(next)) return
  scheduleHide()
}

watch(open, async (isOpen) => {
  await nextTick()
  syncDescribedBy(isOpen)
})

onBeforeUnmount(() => {
  clearTimers()
  clearDescribedBy(describedEl)
  describedEl = null
})

const contentClasses = [
  'z-kablui-tooltip pointer-events-none max-w-xs rounded-kablui-md',
  'border border-kablui-border bg-kablui-bg px-2 py-1',
  'text-kablui-sm text-kablui-fg shadow-kablui-md',
].join(' ')
</script>

<template>
  <span
    ref="anchorRef"
    v-bind="omitDataTestId(attrs)"
    class="inline-flex"
    data-slot="tooltip"
    :data-testid="testIdBase"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <slot />
  </span>

  <Teleport to="body">
    <div
      v-if="open"
      :id="tooltipId"
      ref="floatingRef"
      role="tooltip"
      data-slot="tooltip-content"
      :data-testid="partTestId(testIdBase, 'content')"
      :data-placement="placement"
      :class="contentClasses"
      :style="style"
    >
      <slot name="content">{{ content }}</slot>
    </div>
  </Teleport>
</template>
