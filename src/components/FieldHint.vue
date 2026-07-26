<script setup lang="ts">
import { computed, onBeforeUnmount, useSlots, watchEffect, type VNode } from 'vue'
import { useField } from '../composables/useField'

export type FieldHintProps = Record<string, never>

const field = useField()
const slots = useSlots()

const hasContent = computed(() => {
  const nodes = slots.default?.({})
  if (!nodes || nodes.length === 0) return false
  return nodes.some((node: VNode) => {
    if (typeof node.children === 'string') return node.children.trim().length > 0
    return node.children != null
  })
})

const visible = computed(() => hasContent.value)

watchEffect(() => {
  field?.setHasHint(visible.value)
})

onBeforeUnmount(() => {
  field?.setHasHint(false)
})
</script>

<template>
  <p
    v-if="visible"
    :id="field?.hintId"
    class="text-kablui-sm text-kablui-muted-fg"
    data-slot="field-hint"
    data-testid="field-hint"
  >
    <slot />
  </p>
</template>
