<script setup lang="ts">
import { Button, Icon } from 'kablui'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button variant="outline">
      <Icon size="sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Icon>
      With icon
    </Button>

    <Button variant="ghost" aria-label="More options">
      <Icon size="sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </Icon>
    </Button>
  </div>
</template>
