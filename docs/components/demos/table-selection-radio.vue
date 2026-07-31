<script setup lang="ts">
import { ref } from 'vue'
import { Table, TableColumn } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Scientist' },
]

const selection = ref<(typeof rows)[number] | null>(null)
</script>

<template>
  <div class="space-y-2">
    <Table v-model:selection="selection" :value="rows" data-key="id">
      <TableColumn selection-mode="single" header-style="width: 3rem" />
      <TableColumn field="name" header="Name" />
      <TableColumn field="role" header="Role" />
    </Table>
    <p class="text-kablui-sm text-kablui-muted-fg">
      Selected: {{ selection?.name ?? 'none' }}
    </p>
  </div>
</template>
