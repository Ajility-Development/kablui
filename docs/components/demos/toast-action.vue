<script setup lang="ts">
import { Button, useToast } from 'kablui'

const { toast, dismiss } = useToast()

function showUndo() {
  const id = toast({
    tone: 'warning',
    title: 'Item deleted',
    description: 'Your change can be reverted.',
    action: {
      label: 'Undo',
      onClick: () => {
        dismiss(id)
        toast({ tone: 'success', title: 'Restored' })
      },
    },
  })
}
</script>

<template>
  <Button size="sm" variant="outline" @click="showUndo">Undo action</Button>
</template>
