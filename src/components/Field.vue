<script setup lang="ts">
import { toRef } from 'vue'
import { provideField } from '../composables/useField'

export interface FieldProps {
  invalid?: boolean
  /** Optional stable id for the nested control (otherwise auto-generated). */
  id?: string
}

const props = withDefaults(defineProps<FieldProps>(), {
  invalid: false,
})

provideField({
  invalid: toRef(props, 'invalid'),
  id: props.id,
})
</script>

<template>
  <div class="flex flex-col gap-1.5" data-slot="field">
    <slot />
  </div>
</template>
