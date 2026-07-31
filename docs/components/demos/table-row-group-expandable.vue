<script setup lang="ts">
import { ref } from 'vue'
import { Table, TableColumn } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer' },
  { id: 2, name: 'Alan Turing', role: 'Engineer' },
  { id: 3, name: 'Margaret Hamilton', role: 'Engineer' },
  { id: 4, name: 'Grace Hopper', role: 'Admiral' },
  { id: 5, name: 'Katherine Johnson', role: 'Mathematician' },
]

/** Start with Engineers expanded. */
const expandedRowGroups = ref<unknown[]>(['Engineer'])
</script>

<template>
  <Table
    v-model:expanded-row-groups="expandedRowGroups"
    :value="rows"
    data-key="id"
    group-rows-by="role"
    row-group-mode="subheader"
    expandable-row-groups
    show-gridlines
  >
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
    <template #groupheader="{ groupValue }">
      <span class="font-kablui-semibold">{{ groupValue }}</span>
    </template>
    <template #groupfooter="{ rows: groupRows }">
      <span class="text-kablui-sm text-kablui-muted-fg">{{ groupRows.length }} people</span>
    </template>
  </Table>
</template>
