<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const rows = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
}))
</script>

<template>
  <Table :value="rows" data-key="id" paginate :rows="5">
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
  </Table>
</template>
