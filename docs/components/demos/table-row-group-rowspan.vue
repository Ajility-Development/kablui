<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer' },
  { id: 2, name: 'Alan Turing', role: 'Engineer' },
  { id: 3, name: 'Margaret Hamilton', role: 'Engineer' },
  { id: 4, name: 'Grace Hopper', role: 'Admiral' },
  { id: 5, name: 'Katherine Johnson', role: 'Mathematician' },
]
</script>

<template>
  <Table
    :value="rows"
    data-key="id"
    group-rows-by="role"
    row-group-mode="rowspan"
    show-gridlines
  >
    <TableColumn field="role" header="Role" />
    <TableColumn field="name" header="Name" />
  </Table>
</template>
