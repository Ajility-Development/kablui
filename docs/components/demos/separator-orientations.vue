<script setup lang="ts">
import { Separator, Text } from 'kablui'
</script>

<template>
  <div class="space-y-3">
    <Text size="sm" tone="muted">Horizontal (default decorative)</Text>
    <Separator />

    <Text size="sm" tone="muted">Vertical + semantic</Text>
    <div class="flex h-8 items-center gap-3">
      <Text size="sm">Left</Text>
      <Separator orientation="vertical" :decorative="false" class="self-stretch" />
      <Text size="sm">Right</Text>
    </div>
  </div>
</template>
