<script setup lang="ts">
import { Skeleton, Stack } from 'kablui'
</script>

<template>
  <div class="flex items-center gap-3">
    <Skeleton circle width="2.5rem" height="2.5rem" />
    <Stack gap="sm" class="flex-1">
      <Skeleton width="60%" height="0.875rem" />
      <Skeleton width="90%" height="0.875rem" />
    </Stack>
  </div>
</template>
