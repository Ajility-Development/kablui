<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldHint, FieldLabel, Switch } from 'kablui'

const notifications = ref(true)
</script>

<template>
  <Field>
    <div class="flex items-center gap-2">
      <Switch v-model="notifications" name="notifications" />
      <FieldLabel>Email notifications</FieldLabel>
    </div>
    <FieldHint>Space or click toggles the switch.</FieldHint>
  </Field>
</template>
