<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldHint, FieldLabel, Select } from 'kablui'
import type { SelectOption } from 'kablui'

const country = ref('')

const countries: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany', disabled: true },
]
</script>

<template>
  <Field>
    <FieldLabel>Country</FieldLabel>
    <Select
      v-model="country"
      name="country"
      placeholder="Select a country"
      :options="countries"
    />
    <FieldHint>Arrow keys, typeahead, Escape.</FieldHint>
  </Field>
</template>
