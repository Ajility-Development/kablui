<script setup lang="ts">
import { ref } from 'vue'
import { Button, Popover, PopoverContent, PopoverTrigger, Stack, Text } from 'kablui'

const open = ref(false)

function applyFilters() {
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open" placement="bottom-end">
    <PopoverTrigger>Filters</PopoverTrigger>
    <PopoverContent aria-label="Filters">
      <Stack gap="sm">
        <Text size="sm">Narrow results by status or owner.</Text>
        <Button size="sm" variant="solid" @click="applyFilters">Apply</Button>
      </Stack>
    </PopoverContent>
  </Popover>
</template>
