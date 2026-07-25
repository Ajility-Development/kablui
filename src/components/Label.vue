<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useField } from '../composables/useField'

export interface LabelProps {
  required?: boolean
  for?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<LabelProps>(), {
  required: false,
})

const attrs = useAttrs()
const field = useField()

const forId = computed(() => props.for || field?.controlId)
</script>

<template>
  <label
    :for="forId"
    class="inline-flex items-center gap-1 text-kablui-sm font-kablui-medium text-kablui-fg"
    v-bind="attrs"
  >
    <slot />
    <span v-if="required" class="text-kablui-danger" aria-hidden="true">*</span>
  </label>
</template>
