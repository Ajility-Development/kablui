<script setup lang="ts">
import { ref } from 'vue'
import { Button, Progress, Stack } from 'kablui'

const progress = ref(42)
</script>

<template>
  <Stack gap="sm" class="max-w-md">
    <Progress :value="progress" :caption="`${progress}% complete`" />
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" @click="progress = Math.max(0, progress - 10)">
        −10
      </Button>
      <Button size="sm" variant="outline" @click="progress = Math.min(100, progress + 10)">
        +10
      </Button>
    </div>
  </Stack>
</template>
