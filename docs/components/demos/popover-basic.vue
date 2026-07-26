<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger, Stack, Text } from 'kablui'
</script>

<template>
  <Popover>
    <PopoverTrigger>Details</PopoverTrigger>
    <PopoverContent aria-label="Account details">
      <Stack gap="sm">
        <Text size="sm">Signed in as ada@example.com</Text>
        <Text size="sm" tone="muted">Plan renews on August 1.</Text>
      </Stack>
    </PopoverContent>
  </Popover>
</template>
