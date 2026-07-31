<script setup lang="ts">
import { ref } from 'vue'
import { Table, TableColumn } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician', status: 'Active' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', status: 'Active' },
  { id: 3, name: 'Alan Turing', role: 'Scientist', status: 'Active' },
]

const columnOrder = ref(['name', 'role', 'status'])
</script>

<template>
  <Table
    v-model:column-order="columnOrder"
    :value="rows"
    data-key="id"
    reorderable-columns
    show-gridlines
  >
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
    <TableColumn field="status" header="Status" />
  </Table>
  <p class="mt-2 text-kablui-sm text-kablui-muted-fg">
    Order: {{ columnOrder.join(' → ') }}
  </p>
</template>
