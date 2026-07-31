<script setup lang="ts">
import { ref } from 'vue'
import { Input, Table, TableColumn, type TableCellEditCompleteEvent } from 'kablui'

type Row = { id: number; name: string; role: string }

const rows = ref<Row[]>([
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Scientist' },
])

const selection = ref<Row[]>([])

function onCellEditComplete(event: TableCellEditCompleteEvent) {
  const next = [...rows.value]
  const row = next[event.index] as Record<string, unknown> | undefined
  if (!row || !event.field) return
  row[event.field] = event.newValue
  rows.value = next as Row[]
}
</script>

<template>
  <div class="space-y-2">
    <Table
      v-model:selection="selection"
      :value="rows"
      data-key="id"
      edit-mode="cell"
      @cell-edit-complete="onCellEditComplete"
    >
      <TableColumn selection-mode="multiple" header-style="width: 3rem" />
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
    <p class="text-kablui-sm text-kablui-muted-fg">
      Selected: {{ selection.map((r) => r.name).join(', ') || 'none' }}
    </p>
  </div>
</template>
