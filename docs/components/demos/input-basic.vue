<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldHint, FieldLabel, Input } from 'kablui'

const name = ref('')
</script>

<template>
  <Field>
    <FieldLabel>Name</FieldLabel>
    <Input v-model="name" name="name" placeholder="Ada Lovelace" />
    <FieldHint>Used on invoices and receipts.</FieldHint>
  </Field>
</template>
