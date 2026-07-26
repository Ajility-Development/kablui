<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldHint, FieldLabel, Textarea } from 'kablui'

const bio = ref('')
</script>

<template>
  <Field>
    <FieldLabel>Bio</FieldLabel>
    <Textarea v-model="bio" name="bio" :rows="3" placeholder="Short introduction" />
    <FieldHint>Plain text, a few sentences.</FieldHint>
  </Field>
</template>
