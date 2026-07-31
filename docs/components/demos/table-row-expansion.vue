<script setup lang="ts">
import { ref } from 'vue'
import { Table, TableColumn, type TableExpandedRows } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician', notes: 'Wrote the first algorithm intended for a machine.' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', notes: 'Pioneer of COBOL and compiler design.' },
  { id: 3, name: 'Alan Turing', role: 'Scientist', notes: 'Foundational work in computing and cryptography.' },
]

const expandedRows = ref<TableExpandedRows>({})
</script>

<template>
  <Table v-model:expanded-rows="expandedRows" :value="rows" data-key="id" show-gridlines>
    <TableColumn expander header-style="width: 3rem" />
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
    <template #expansion="{ data }">
      <div class="text-kablui-sm text-kablui-muted-fg">
        {{ data.notes }}
      </div>
    </template>
  </Table>
</template>
