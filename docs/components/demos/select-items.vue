<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldLabel, Select, SelectItem } from 'kablui'

const fruit = ref('apple')
</script>

<template>
  <Field>
    <FieldLabel>Favorite fruit</FieldLabel>
    <Select v-model="fruit" name="fruit" placeholder="Pick one">
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="cherry" disabled>Cherry</SelectItem>
      <SelectItem value="mango">Mango</SelectItem>
    </Select>
  </Field>
</template>
