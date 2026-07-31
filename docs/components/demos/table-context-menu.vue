<script setup lang="ts">
import { nextTick, ref } from 'vue'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Table,
  TableColumn,
  Text,
  type TableRowContextMenuEvent,
} from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Scientist' },
]

const contextMenuSelection = ref<(typeof rows)[number] | null>(null)
const menuOpen = ref(false)
const anchor = ref({ x: 0, y: 0 })
const lastAction = ref<string | null>(null)
/** Avoid clearing `contextMenuSelection` while repositioning an open menu. */
let reopening = false

async function onRowContextMenu(event: TableRowContextMenuEvent) {
  const oe = event.originalEvent as MouseEvent
  anchor.value = { x: oe.clientX, y: oe.clientY }
  if (menuOpen.value) {
    reopening = true
    menuOpen.value = false
    await nextTick()
    reopening = false
  }
  menuOpen.value = true
}

function onMenuSelect(action: string) {
  lastAction.value = action
  menuOpen.value = false
  contextMenuSelection.value = null
}

function onMenuOpenUpdate(open: boolean) {
  menuOpen.value = open
  if (!open && !reopening) contextMenuSelection.value = null
}
</script>

<template>
  <div class="space-y-2">
    <!-- Invisible anchor at the right-click point; Menu floats from it. -->
    <Menu :open="menuOpen" placement="bottom-start" @update:open="onMenuOpenUpdate">
      <MenuTrigger
        class="fixed! m-0! h-px! w-px! overflow-hidden! border-0! p-0! opacity-0! pointer-events-none"
        :style="{ left: `${anchor.x}px`, top: `${anchor.y}px` }"
        tabindex="-1"
      >
        <span class="sr-only">Row actions</span>
      </MenuTrigger>
      <MenuContent>
        <MenuItem @select="onMenuSelect('View')">View</MenuItem>
        <MenuItem @select="onMenuSelect('Edit')">Edit</MenuItem>
        <MenuSeparator />
        <MenuItem @select="onMenuSelect('Delete')">Delete</MenuItem>
      </MenuContent>
    </Menu>

    <Table
      v-model:context-menu-selection="contextMenuSelection"
      :value="rows"
      data-key="id"
      context-menu
      @row-contextmenu="onRowContextMenu"
    >
      <TableColumn field="name" header="Name" />
      <TableColumn field="role" header="Role" />
    </Table>

    <Text size="sm" tone="muted">
      Right-click a row. Context row:
      {{ contextMenuSelection?.name ?? 'none' }}. Last action:
      {{ lastAction ?? 'none' }}.
    </Text>
  </div>
</template>
