<script setup lang="ts">
import { Alert, Stack } from 'kablui'
</script>

<template>
  <Stack gap="sm">
    <Alert tone="neutral" title="Neutral">Supporting copy for a status message.</Alert>
    <Alert tone="accent" title="Accent">Highlight something noteworthy.</Alert>
    <Alert tone="success" title="Success">Changes saved.</Alert>
    <Alert tone="warning" title="Warning">Review before continuing.</Alert>
    <Alert tone="danger" title="Danger">Something went wrong.</Alert>
  </Stack>
</template>
