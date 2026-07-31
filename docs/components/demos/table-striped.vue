<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const rows = [
  { id: 1, name: 'Ada', role: 'Engineer' },
  { id: 2, name: 'Grace', role: 'Admiral' },
  { id: 3, name: 'Alan', role: 'Scientist' },
  { id: 4, name: 'Katherine', role: 'Mathematician' },
]
</script>

<template>
  <Table :value="rows" data-key="id" striped>
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
  </Table>
</template>
