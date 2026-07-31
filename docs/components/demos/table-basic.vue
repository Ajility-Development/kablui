<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Scientist' },
]
</script>

<template>
  <Table :value="rows" data-key="id">
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
  </Table>
</template>
