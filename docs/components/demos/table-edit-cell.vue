<script setup lang="ts">
import { ref } from 'vue'
import { Input, Table, TableColumn, type TableCellEditCompleteEvent } from 'kablui'

const rows = ref([
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Scientist' },
])

function onCellEditComplete(event: TableCellEditCompleteEvent) {
  const next = [...rows.value]
  const row = next[event.index] as Record<string, unknown> | undefined
  if (!row || !event.field) return
  row[event.field] = event.newValue
  rows.value = next as typeof rows.value
}
</script>

<template>
  <Table
    :value="rows"
    data-key="id"
    edit-mode="cell"
    @cell-edit-complete="onCellEditComplete"
  >
    <TableColumn field="name" header="Name">
      <template #editor="{ data, field }">
        <Input v-model="data[field]" size="sm" />
      </template>
    </TableColumn>
    <TableColumn field="role" header="Role">
      <template #editor="{ data, field }">
        <Input v-model="data[field]" size="sm" />
      </template>
    </TableColumn>
  </Table>
</template>
