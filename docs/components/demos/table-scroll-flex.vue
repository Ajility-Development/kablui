<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const rows = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
}))
</script>

<template>
  <div class="flex h-64 flex-col">
    <Table :value="rows" data-key="id" scroll-height="flex" class="min-h-0 flex-1">
      <TableColumn field="name" header="Name" />
      <TableColumn field="role" header="Role" />
    </Table>
  </div>
</template>
