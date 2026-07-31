<script setup lang="ts">
import { Badge, Cluster, Table, TableColumn, Text } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', status: 'Active' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', status: 'Active' },
  { id: 3, name: 'Alan Turing', role: 'Scientist', status: 'Away' },
]
</script>

<template>
  <Table :value="rows" data-key="id">
    <!-- Table-level toolbar above the grid (outside the scrollport). -->
    <template #header>
      <Cluster justify="between" align="center" class="w-full">
        <Text weight="semibold">Team directory</Text>
        <Text size="sm" tone="muted">Updated today</Text>
      </Cluster>
    </template>
    <TableColumn field="name" header="Name">
      <template #body="{ data }">
        <span class="font-kablui-medium">{{ data.name }}</span>
      </template>
    </TableColumn>
    <TableColumn field="role" header="Role" />
    <TableColumn field="status" header="Status">
      <template #header>
        <span class="uppercase tracking-wide text-kablui-sm">Status</span>
      </template>
      <template #body="{ data }">
        <Badge :tone="data.status === 'Active' ? 'success' : 'neutral'">
          {{ data.status }}
        </Badge>
      </template>
    </TableColumn>
    <!-- Table-level summary below the grid (outside the scrollport). -->
    <template #footer>
      <Text size="sm" tone="muted">{{ rows.length }} people</Text>
    </template>
  </Table>
</template>
