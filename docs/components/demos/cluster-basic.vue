<script setup lang="ts">
import { Badge, Cluster } from 'kablui'
</script>

<template>
  <Cluster
    gap="sm"
    class="rounded-kablui-md border border-kablui-border bg-kablui-muted/40 p-3"
  >
    <Badge
      v-for="n in 8"
      :key="n"
      :tone="n % 3 === 0 ? 'accent' : 'neutral'"
      size="sm"
    >
      Item {{ n }}
    </Badge>
  </Cluster>
</template>
