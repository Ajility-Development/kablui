<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, Field, FieldLabel } from 'kablui'

const subscribe = ref(false)
</script>

<template>
  <Field>
    <div class="flex items-center gap-2">
      <Checkbox v-model="subscribe" name="subscribe" />
      <FieldLabel>Subscribe to product updates</FieldLabel>
    </div>
  </Field>
</template>
