<script setup lang="ts">
import { Button, Cluster, useToast } from 'kablui'
import type { ToastTone } from 'kablui'

const { toast } = useToast()

function showToast(tone: ToastTone) {
  toast({
    tone,
    title:
      tone === 'success'
        ? 'Saved'
        : tone === 'danger'
          ? 'Failed'
          : tone === 'warning'
            ? 'Heads up'
            : tone === 'accent'
              ? 'Note'
              : 'Hello',
    description: 'Toast from useToast().',
  })
}
</script>

<template>
  <Cluster gap="sm">
    <Button size="sm" variant="outline" @click="showToast('neutral')">Neutral</Button>
    <Button size="sm" variant="outline" @click="showToast('accent')">Accent</Button>
    <Button size="sm" variant="outline" @click="showToast('success')">Success</Button>
    <Button size="sm" variant="outline" @click="showToast('warning')">Warning</Button>
    <Button size="sm" variant="outline" @click="showToast('danger')">Danger</Button>
  </Cluster>
</template>
