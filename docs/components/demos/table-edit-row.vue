<script setup lang="ts">
import { ref } from 'vue'
import { Input, Table, TableColumn, type TableRowEditSaveEvent } from 'kablui'

type Row = { id: number; name: string; role: string }

const rows = ref<Row[]>([
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Scientist' },
])

const editingRows = ref<Row[]>([])

function onRowEditSave(event: TableRowEditSaveEvent) {
  const data = event.data as Row
  const index = rows.value.findIndex((r) => r.id === data.id)
  if (index === -1) return
  const next = [...rows.value]
  next[index] = event.newData as Row
  rows.value = next
}
</script>

<template>
  <Table
    v-model:editing-rows="editingRows"
    :value="rows"
    data-key="id"
    edit-mode="row"
    @row-edit-save="onRowEditSave"
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
    <TableColumn row-editor header-style="width: 6rem" body-style="text-align: center" />
  </Table>
</template>
