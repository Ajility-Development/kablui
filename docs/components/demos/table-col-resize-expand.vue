<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician', company: 'Analytical Engines', status: 'Active' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', company: 'US Navy', status: 'Active' },
  { id: 3, name: 'Alan Turing', role: 'Scientist', company: 'Bletchley Park', status: 'Active' },
]
</script>

<template>
  <Table
    :value="rows"
    data-key="id"
    resizable-columns
    column-resize-mode="expand"
    show-gridlines
    scroll-height="220px"
  >
    <TableColumn field="name" header="Name" width="160px" />
    <TableColumn field="role" header="Role" width="140px" />
    <TableColumn field="company" header="Company" width="180px" />
    <TableColumn field="status" header="Status" width="120px" />
  </Table>
</template>
