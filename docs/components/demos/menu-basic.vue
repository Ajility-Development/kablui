<script setup lang="ts">
import { ref } from 'vue'
import {
  Cluster,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Text,
} from 'kablui'

const lastAction = ref<string | null>(null)
</script>

<template>
  <Cluster gap="sm" class="items-center">
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem @select="lastAction = 'Edit'">Edit</MenuItem>
        <MenuItem @select="lastAction = 'Duplicate'">Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem disabled @select="lastAction = 'Archive'">Archive</MenuItem>
        <MenuItem @select="lastAction = 'Delete'">Delete</MenuItem>
      </MenuContent>
    </Menu>
    <Text size="sm" tone="muted">Last action: {{ lastAction ?? 'none' }}</Text>
  </Cluster>
</template>
