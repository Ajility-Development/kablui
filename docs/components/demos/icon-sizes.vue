<script setup lang="ts">
import { Icon, Text } from 'kablui'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4 text-kablui-fg">
    <Icon size="sm" label="Check small">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </Icon>
    <Icon size="md" label="Check medium">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </Icon>
    <Icon size="lg" label="Check large">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </Icon>

    <span class="flex flex-col items-center gap-1 text-kablui-accent">
      <Icon size="md" title="Accent currentColor">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      </Icon>
      <Text size="sm" tone="muted">title = tooltip only</Text>
    </span>

    <span class="flex flex-col items-center gap-1">
      <Icon size="md">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Icon>
      <Text size="sm" tone="muted">decorative</Text>
    </span>
  </div>
</template>
