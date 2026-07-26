<script setup lang="ts">
import { ref } from 'vue'
import { Button, Cluster, Dialog, Text } from 'kablui'

const open = ref(false)
const status = ref<string | null>(null)

function onConfirm() {
  open.value = false
  status.value = 'Confirmed'
}

function onCancel() {
  open.value = false
  status.value = 'Cancelled'
}
</script>

<template>
  <Cluster gap="sm" class="items-center">
    <Button variant="solid" @click="open = true">Open dialog</Button>
    <Text v-if="status" size="sm" tone="muted">Status: {{ status }}</Text>
  </Cluster>

  <Dialog v-model:open="open" show-dismiss>
    <template #title>Confirm action</template>
    <template #description>
      Escape, backdrop click, or the dismiss button closes this dialog.
    </template>
    <Text size="sm">Focus stays trapped while open; body scroll is locked.</Text>
    <template #footer>
      <Button variant="ghost" @click="onCancel">Cancel</Button>
      <Button variant="solid" @click="onConfirm">Confirm</Button>
    </template>
  </Dialog>
</template>
