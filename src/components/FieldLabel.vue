<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useField } from '../composables/useField'

export interface FieldLabelProps {
  required?: boolean
  for?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<FieldLabelProps>(), {
  required: false,
})

const attrs = useAttrs()
const field = useField()

const forId = computed(() => props.for || field?.controlId.value)
</script>

<template>
  <label
    :for="forId"
    class="inline-flex items-center gap-1 text-kablui-sm font-kablui-medium text-kablui-fg"
    data-slot="field-label"
    data-testid="field-label"
    v-bind="attrs"
  >
    <slot />
    <span v-if="required" class="text-kablui-danger" aria-hidden="true">*</span>
  </label>
</template>
