<script setup lang="ts">
import { ref } from 'vue'
import { Field, FieldLabel, Radio, RadioGroup } from 'kablui'

const plan = ref('pro')
</script>

<template>
  <Field>
    <FieldLabel>Plan</FieldLabel>
    <RadioGroup v-model="plan" name="plan" orientation="horizontal">
      <label class="inline-flex items-center gap-2">
        <Radio value="free" /> Free
      </label>
      <label class="inline-flex items-center gap-2">
        <Radio value="pro" /> Pro
      </label>
      <label class="inline-flex items-center gap-2">
        <Radio value="enterprise" disabled /> Enterprise
      </label>
    </RadioGroup>
  </Field>
</template>
