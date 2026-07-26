<script setup lang="ts">
import { Spinner } from 'kablui'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4 text-kablui-fg">
    <Spinner size="sm" label="Loading small" />
    <Spinner size="md" label="Loading" />
    <Spinner size="lg" label="Loading large" />
  </div>
</template>
