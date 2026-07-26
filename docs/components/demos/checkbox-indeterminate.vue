<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, Field, FieldLabel } from 'kablui'

const allSelected = ref(false)
</script>

<template>
  <Field>
    <div class="flex items-center gap-2">
      <Checkbox v-model="allSelected" indeterminate />
      <FieldLabel>Select all (mixed)</FieldLabel>
    </div>
  </Field>
</template>
