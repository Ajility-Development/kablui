<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldError, FieldHint, FieldLabel, Input } from 'kablui'

const name = ref('')
</script>

<template>
  <Field :invalid="!name">
    <FieldLabel required>Name</FieldLabel>
    <Input v-model="name" name="name" placeholder="Ada Lovelace" />
    <FieldHint>Used on invoices and receipts.</FieldHint>
    <FieldError v-if="!name">Name is required.</FieldError>
  </Field>
</template>
