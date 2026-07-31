<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician', status: 'Active' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', status: 'Active' },
  { id: 3, name: 'Alan Turing', role: 'Scientist', status: 'Active' },
]
</script>

<template>
  <Table
    :value="rows"
    data-key="id"
    resizable-columns
    column-resize-mode="fit"
    show-gridlines
  >
    <TableColumn field="name" header="Name" width="180px" />
    <TableColumn field="role" header="Role" width="180px" />
    <TableColumn field="status" header="Status" width="140px" />
  </Table>
</template>
