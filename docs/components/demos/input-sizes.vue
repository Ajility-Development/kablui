<script setup lang="ts">
import { ref } from 'vue'
import { Input, Stack } from 'kablui'

const email = ref('you@example.com')
</script>

<template>
  <Stack gap="sm">
    <Input v-model="email" type="email" size="sm" placeholder="sm" />
    <Input v-model="email" type="email" size="md" placeholder="md" />
    <Input v-model="email" type="email" size="lg" placeholder="lg" />
  </Stack>
</template>
