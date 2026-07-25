<script setup lang="ts">
import { computed, onBeforeUnmount, useSlots, watchEffect } from 'vue'
import { useField } from '../composables/useField'

export interface FieldErrorProps {}

defineProps<FieldErrorProps>()

const field = useField()
const slots = useSlots()

const hasContent = computed(() => {
  const nodes = slots.default?.()
  if (!nodes || nodes.length === 0) return false
  return nodes.some((node) => {
    if (typeof node.children === 'string') return node.children.trim().length > 0
    return node.children != null
  })
})

const visible = computed(() => hasContent.value || !!field?.invalid.value)

watchEffect(() => {
  field?.setHasError(visible.value && hasContent.value)
})

onBeforeUnmount(() => {
  field?.setHasError(false)
})
</script>

<template>
  <p
    v-if="visible && hasContent"
    :id="field?.errorId"
    role="alert"
    class="text-kablui-sm text-kablui-danger"
    data-slot="field-error"
  >
    <slot />
  </p>
</template>
