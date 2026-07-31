<script setup lang="ts">
import { Table, TableColumn, Text } from 'kablui'

const rows = [
  {
    id: 1,
    name: 'Ada Lovelace',
    role: 'Mathematician',
  },
  {
    id: 2,
    name: 'Grace Hopper',
    role: 'Computer scientist',
  },
  {
    id: 3,
    name: 'Alan Turing',
    role: 'Logician',
  },
]

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="grid gap-6 md:grid-cols-3">
    <div v-for="size in sizes" :key="size" class="flex min-w-0 flex-col gap-2">
      <Text size="sm" tone="muted">size="{{ size }}"</Text>
      <Table :value="rows" data-key="id" :size="size">
        <TableColumn field="name" header="Name" />
        <TableColumn field="role" header="Role" />
      </Table>
    </div>
  </div>
</template>
