<script setup lang="ts">
import { Text } from 'kablui'
</script>

<template>
  <div class="space-y-2">
    <Text as="h4" size="lg" weight="semibold">Heading via as="h4"</Text>
    <Text size="sm" tone="muted">Small muted supporting copy.</Text>
    <Text size="md" weight="medium" tone="accent">Medium accent label</Text>
    <Text as="span" size="sm" tone="danger">Inline danger span</Text>
  </div>
</template>
