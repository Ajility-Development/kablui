<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useField } from '../composables/useField'

export interface FieldHintProps {}

defineProps<FieldHintProps>()

const field = useField()

onMounted(() => {
  field?.setHasHint(true)
})

onBeforeUnmount(() => {
  field?.setHasHint(false)
})
</script>

<template>
  <p :id="field?.hintId" class="text-kablui-sm text-kablui-muted-fg" data-slot="field-hint">
    <slot />
  </p>
</template>
