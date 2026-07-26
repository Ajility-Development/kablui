<script setup lang="ts">
import { ref } from 'vue'
import { Alert, Button } from 'kablui'

const visible = ref(true)
</script>

<template>
  <Alert
    v-if="visible"
    tone="neutral"
    title="Dismissible"
    dismissible
    @dismiss="visible = false"
  >
    Click × to hide this alert.
  </Alert>
  <Button v-else size="sm" variant="outline" @click="visible = true">
    Show dismissible alert
  </Button>
</template>
