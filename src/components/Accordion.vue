<script setup lang="ts">
import { computed, provide, useAttrs } from 'vue'
import { omitDataTestId, resolveTestId } from '../utils/testId'
import { ACCORDION_KEY } from './accordionContext'

export interface AccordionProps {
  /** Single opens one item; multiple allows several. */
  type?: 'single' | 'multiple'
  /** When type is single, allow collapsing the open item. Default true. */
  collapsible?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<AccordionProps>(), {
  type: 'single',
  collapsible: true,
})

const model = defineModel<string | string[] | undefined>()

const attrs = useAttrs()
const testIdBase = computed(() => resolveTestId(attrs, 'accordion'))
const bindAttrs = computed(() => omitDataTestId(attrs))

interface TriggerEntry {
  el: HTMLButtonElement | null
  disabled: boolean
}

const triggers = new Map<string, TriggerEntry>()
const triggerOrder: string[] = []

function isOpen(value: string): boolean {
  if (props.type === 'multiple') {
    return Array.isArray(model.value) && model.value.includes(value)
  }
  return model.value === value
}

function toggle(value: string) {
  if (props.type === 'multiple') {
    const current = Array.isArray(model.value) ? [...model.value] : []
    const index = current.indexOf(value)
    if (index >= 0) current.splice(index, 1)
    else current.push(value)
    model.value = current
    return
  }

  if (model.value === value) {
    if (props.collapsible) model.value = undefined
    return
  }
  model.value = value
}

function registerTrigger(value: string, el: HTMLButtonElement | null, disabled: boolean) {
  if (!triggers.has(value)) triggerOrder.push(value)
  triggers.set(value, { el, disabled })
}

function unregisterTrigger(value: string) {
  triggers.delete(value)
  const index = triggerOrder.indexOf(value)
  if (index >= 0) triggerOrder.splice(index, 1)
}

function enabledTriggers(): HTMLButtonElement[] {
  return triggerOrder
    .map((value) => triggers.get(value))
    .filter((entry): entry is TriggerEntry => !!entry && !entry.disabled && !!entry.el)
    .map((entry) => entry.el!)
}

function focusRelative(currentValue: string, delta: number) {
  const list = enabledTriggers()
  if (list.length === 0) return

  const current = triggers.get(currentValue)?.el
  const index = current ? list.indexOf(current) : -1
  if (index === -1) {
    list[0]?.focus()
    return
  }
  const next = list[(index + delta + list.length) % list.length]!
  next.focus()
}

provide(ACCORDION_KEY, {
  type: computed(() => props.type),
  collapsible: computed(() => props.collapsible),
  isOpen,
  toggle,
  registerTrigger,
  unregisterTrigger,
  focusRelative,
  testIdBase,
})
</script>

<template>
  <div data-slot="accordion" :data-testid="testIdBase" v-bind="bindAttrs">
    <slot />
  </div>
</template>
