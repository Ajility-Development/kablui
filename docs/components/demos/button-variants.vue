<script setup lang="ts">
import { Button } from 'kablui'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button variant="solid">Solid</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button size="sm">sm</Button>
    <Button size="lg">lg</Button>
    <Button disabled>Disabled</Button>
  </div>
</template>
