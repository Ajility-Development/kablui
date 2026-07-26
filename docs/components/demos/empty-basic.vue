<script setup lang="ts">
import { Button, Empty, Icon } from 'kablui'
</script>

<template>
  <div class="rounded-kablui-md border border-kablui-border">
    <Empty title="No results">
      <template #icon>
        <Icon size="lg" label="Empty inbox">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </Icon>
      </template>
      Try a different filter or create something new.
      <template #action>
        <Button size="sm" variant="outline">Create item</Button>
      </template>
    </Empty>
  </div>
</template>
