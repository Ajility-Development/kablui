<script setup lang="ts">
import { ref } from 'vue'
import {
  Button,
  Checkbox,
  Cluster,
  Dialog,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  Tooltip,
  useToast,
  type ToastTone,
} from '../../src'

const dialogOpen = ref(false)
const dialogStatus = ref<string | null>(null)
const popoverOpen = ref(false)
const filterActive = ref(true)
const filterArchived = ref(false)
const lastMenuAction = ref<string | null>(null)
const stickyId = ref<string | null>(null)
const undoSnapshot = ref('Draft title')
const documentTitle = ref('Draft title')

const { toast, dismiss } = useToast()

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
              ? 'Accent'
              : 'Hello',
    description: 'Toast from useToast().',
  })
}

function confirmDialog() {
  dialogOpen.value = false
  dialogStatus.value = 'Confirmed'
  toast({
    tone: 'success',
    title: 'Confirmed',
    description: 'Dialog action completed.',
  })
}

function cancelDialog() {
  dialogOpen.value = false
  dialogStatus.value = 'Cancelled'
}

function applyFilter(label: string) {
  lastMenuAction.value = label
  toast({
    tone: 'neutral',
    title: label,
    description: 'Filter preference updated.',
  })
  popoverOpen.value = false
}

function onMenuSelect(action: string) {
  lastMenuAction.value = action
  toast({
    tone: action === 'Archive' ? 'warning' : 'success',
    title: action,
    description: `${action} selected from Menu.`,
  })
}

function showUndoToast() {
  const previous = documentTitle.value
  documentTitle.value = 'Renamed draft'
  undoSnapshot.value = previous
  toast({
    tone: 'warning',
    title: 'Title changed',
    description: `Now “${documentTitle.value}”.`,
    action: {
      label: 'Undo',
      onClick: () => {
        documentTitle.value = undoSnapshot.value
        toast({
          tone: 'success',
          title: 'Restored',
          description: `Back to “${documentTitle.value}”.`,
        })
      },
    },
  })
}

function showStickyToast() {
  if (stickyId.value) {
    dismiss(stickyId.value)
  }
  stickyId.value = toast({
    tone: 'accent',
    title: 'Sticky notice',
    description: 'Stays until you dismiss it.',
    duration: 0,
  })
}

function dismissSticky() {
  if (!stickyId.value) return
  dismiss(stickyId.value)
  stickyId.value = null
  toast({
    tone: 'neutral',
    title: 'Sticky dismissed',
  })
}
</script>

<template>
  <section id="overlays" class="space-y-8">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Overlays</Text>
      <Text tone="muted" size="sm">
        Dialog, Popover (filters/help), Menu actions, Tooltip, and Toast via useToast.
      </Text>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Dialog</Text>
      <Cluster gap="sm" class="items-center">
        <Button variant="solid" @click="dialogOpen = true">Open dialog</Button>
        <Text v-if="dialogStatus" size="sm" tone="muted">Status: {{ dialogStatus }}</Text>
      </Cluster>
      <Dialog v-model:open="dialogOpen" show-dismiss>
        <template #title>Confirm action</template>
        <template #description>
          Cancel closes only. Confirm closes and shows a success toast.
        </template>
        <Text size="sm">Focus stays trapped while open; body scroll is locked.</Text>
        <template #footer>
          <Button variant="ghost" @click="cancelDialog">Cancel</Button>
          <Button variant="solid" @click="confirmDialog">Confirm</Button>
        </template>
      </Dialog>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Popover</Text>
      <Text size="sm" tone="muted">
        Filters / help panel (not an action menu). Controlled open with apply feedback.
      </Text>
      <Popover v-model:open="popoverOpen">
        <PopoverTrigger>Filters</PopoverTrigger>
        <PopoverContent>
          <Stack gap="sm" class="min-w-52 p-1">
            <Text weight="semibold" size="sm">List filters</Text>
            <Text size="sm" tone="muted">
              Narrow the list. Apply closes the panel and records the choice.
            </Text>
            <label class="inline-flex items-center gap-2 text-kablui-sm">
              <Checkbox v-model="filterActive" />
              Active only
            </label>
            <label class="inline-flex items-center gap-2 text-kablui-sm">
              <Checkbox v-model="filterArchived" />
              Include archived
            </label>
            <Cluster gap="sm">
              <Button
                size="sm"
                variant="solid"
                @click="applyFilter('Filters applied')"
              >
                Apply
              </Button>
              <Button size="sm" variant="ghost" @click="popoverOpen = false">
                Close
              </Button>
            </Cluster>
          </Stack>
        </PopoverContent>
      </Popover>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Menu</Text>
      <Cluster gap="sm" class="items-center">
        <Menu>
          <MenuTrigger>Actions</MenuTrigger>
          <MenuContent>
            <MenuItem @select="onMenuSelect('Edit')">Edit</MenuItem>
            <MenuItem @select="onMenuSelect('Duplicate')">Duplicate</MenuItem>
            <MenuSeparator />
            <MenuItem @select="onMenuSelect('Archive')">Archive</MenuItem>
          </MenuContent>
        </Menu>
        <Text size="sm" tone="muted">
          Last action: {{ lastMenuAction ?? 'none' }}
        </Text>
      </Cluster>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Tooltip</Text>
      <Tooltip content="Helpful hint on hover or focus">
        <Button variant="outline">Hover or focus me</Button>
      </Tooltip>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Toast</Text>
      <Text size="sm" tone="muted">
        Document title: <span class="text-kablui-fg">{{ documentTitle }}</span>
      </Text>
      <Cluster gap="sm">
        <Button size="sm" variant="outline" @click="showToast('neutral')">Neutral</Button>
        <Button size="sm" variant="outline" @click="showToast('accent')">Accent</Button>
        <Button size="sm" variant="outline" @click="showToast('success')">Success</Button>
        <Button size="sm" variant="outline" @click="showToast('warning')">Warning</Button>
        <Button size="sm" variant="outline" @click="showToast('danger')">Danger</Button>
        <Button size="sm" variant="outline" @click="showUndoToast">Undo action</Button>
        <Button size="sm" variant="outline" @click="showStickyToast">Sticky</Button>
        <Button
          size="sm"
          variant="ghost"
          :disabled="!stickyId"
          @click="dismissSticky"
        >
          Dismiss sticky
        </Button>
      </Cluster>
    </div>
  </section>
</template>
