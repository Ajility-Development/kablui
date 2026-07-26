<script setup lang="ts">
import { ref } from 'vue'
import { Button, Cluster, useToast } from 'kablui'

const { toast, dismiss } = useToast()
const stickyId = ref<string | null>(null)

function showSticky() {
  if (stickyId.value) dismiss(stickyId.value)
  stickyId.value = toast({
    title: 'Sticky',
    description: 'Won’t auto-dismiss. Use Dismiss sticky or the × control.',
    duration: 0,
  })
}

function dismissSticky() {
  if (!stickyId.value) return
  dismiss(stickyId.value)
  stickyId.value = null
}
</script>

<template>
  <Cluster gap="sm">
    <Button size="sm" variant="outline" @click="showSticky">Sticky</Button>
    <Button size="sm" variant="outline" :disabled="!stickyId" @click="dismissSticky">
      Dismiss sticky
    </Button>
  </Cluster>
</template>
