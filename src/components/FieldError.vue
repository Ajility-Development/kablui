<script setup lang="ts">
import { computed, onBeforeUnmount, useSlots, watchEffect, type VNode } from 'vue'
import { useField } from '../composables/useField'

export type FieldErrorProps = Record<string, never>

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
  field?.setHasError(visible.value)
})

onBeforeUnmount(() => {
  field?.setHasError(false)
})
</script>

<template>
  <p
    v-if="visible"
    :id="field?.errorId"
    role="alert"
    class="text-kablui-sm text-kablui-danger"
    data-slot="field-error"
    data-testid="field-error"
  >
    <slot />
  </p>
</template>
