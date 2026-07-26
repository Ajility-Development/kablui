<script setup lang="ts">
import { ref } from 'vue'
import { Pagination, Stack, Text } from 'kablui'

const page = ref(1)
</script>

<template>
  <Stack gap="sm">
    <Text size="sm" tone="muted">Page {{ page }} of 12</Text>
    <Pagination v-model:page="page" :page-count="12" />
  </Stack>
</template>
