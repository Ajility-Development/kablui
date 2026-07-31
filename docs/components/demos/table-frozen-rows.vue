<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const frozen = [
  { id: 0, name: 'Pinned lead', role: 'Manager', team: 'Ops' },
]

const rows = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
  team: ['Platform', 'Design', 'Research'][i % 3],
}))
</script>

<template>
  <Table
    :value="rows"
    :frozen-value="frozen"
    data-key="id"
    scroll-height="220px"
    striped
  >
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
    <TableColumn field="team" header="Team" />
  </Table>
</template>
