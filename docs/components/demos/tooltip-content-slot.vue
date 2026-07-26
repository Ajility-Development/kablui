<script setup lang="ts">
import { Button, Tooltip } from 'kablui'
</script>

<template>
  <Tooltip placement="bottom" :delay="150">
    <Button variant="ghost">Details</Button>
    <template #content>Supports a content slot when you need markup.</template>
  </Tooltip>
</template>
