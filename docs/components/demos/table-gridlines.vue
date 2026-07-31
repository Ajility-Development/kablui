<script setup lang="ts">
import { Table, TableColumn, Text } from 'kablui'

const rows = [
  { id: 1, name: 'Ada', role: 'Engineer', team: 'Platform' },
  { id: 2, name: 'Grace', role: 'Admiral', team: 'Ops' },
  { id: 3, name: 'Alan', role: 'Scientist', team: 'Research' },
]
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <div class="flex min-w-0 flex-col gap-2">
      <Text size="sm" tone="muted">Default (no gridlines)</Text>
      <Table :value="rows" data-key="id">
        <TableColumn field="name" header="Name" />
        <TableColumn field="role" header="Role" />
        <TableColumn field="team" header="Team" />
      </Table>
    </div>
    <div class="flex min-w-0 flex-col gap-2">
      <Text size="sm" tone="muted">showGridlines</Text>
      <Table :value="rows" data-key="id" show-gridlines>
        <TableColumn field="name" header="Name" />
        <TableColumn field="role" header="Role" />
        <TableColumn field="team" header="Team" />
      </Table>
    </div>
  </div>
</template>
