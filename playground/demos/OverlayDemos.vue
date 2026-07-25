<script setup lang="ts">
import { ref } from 'vue'
import {
  Button,
  Cluster,
  Dialog,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  Tooltip,
  useToast,
} from '../../src'

const dialogOpen = ref(false)
const { toast } = useToast()

function showToast(tone: 'neutral' | 'success' | 'danger' | 'warning') {
  toast({
    tone,
    title:
      tone === 'success'
        ? 'Saved'
        : tone === 'danger'
          ? 'Failed'
          : tone === 'warning'
            ? 'Heads up'
            : 'Hello',
    description: 'Toast from useToast().',
  })
}
</script>

<template>
  <section class="space-y-8">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Overlays</Text>
      <Text tone="muted" size="sm">
        Dialog, Popover (dropdown-style), Tooltip, and Toast via useToast.
      </Text>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Dialog</Text>
      <Button variant="solid" @click="dialogOpen = true">Open dialog</Button>
      <Dialog v-model:open="dialogOpen" show-close>
        <template #title>Confirm action</template>
        <template #description>
          Escape, backdrop click, or the close button dismisses this dialog.
        </template>
        <Text size="sm">Focus stays trapped while open; body scroll is locked.</Text>
        <template #footer>
          <Button variant="ghost" @click="dialogOpen = false">Cancel</Button>
          <Button variant="solid" @click="dialogOpen = false">Confirm</Button>
        </template>
      </Dialog>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Popover</Text>
      <Popover>
        <PopoverTrigger>Actions</PopoverTrigger>
        <PopoverContent>
          <Stack gap="sm" as="ul" class="m-0 min-w-40 list-none p-0">
            <li>
              <Button variant="ghost" size="sm" class="w-full justify-start">Edit</Button>
            </li>
            <li>
              <Button variant="ghost" size="sm" class="w-full justify-start">Duplicate</Button>
            </li>
            <li>
              <Button variant="ghost" size="sm" class="w-full justify-start">Archive</Button>
            </li>
          </Stack>
        </PopoverContent>
      </Popover>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Tooltip</Text>
      <Tooltip content="Helpful hint on hover or focus">
        <Button variant="outline">Hover or focus me</Button>
      </Tooltip>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Toast</Text>
      <Cluster gap="sm">
        <Button size="sm" variant="outline" @click="showToast('neutral')">Neutral</Button>
        <Button size="sm" variant="outline" @click="showToast('success')">Success</Button>
        <Button size="sm" variant="outline" @click="showToast('warning')">Warning</Button>
        <Button size="sm" variant="outline" @click="showToast('danger')">Danger</Button>
      </Cluster>
    </div>
  </section>
</template>
