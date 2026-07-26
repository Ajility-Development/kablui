<script setup lang="ts">
import { Badge } from 'kablui'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Badge tone="neutral">Neutral</Badge>
    <Badge tone="accent">Accent</Badge>
    <Badge tone="success">Success</Badge>
    <Badge tone="warning">Warning</Badge>
    <Badge tone="danger">Danger</Badge>
    <Badge size="sm" tone="accent">sm accent</Badge>
    <Badge size="lg" tone="accent">lg accent</Badge>
  </div>
</template>
