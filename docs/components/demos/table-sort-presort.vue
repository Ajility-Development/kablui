<script setup lang="ts">
import { ref } from 'vue'
import { Table, TableColumn } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician', score: 90 },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', score: 95 },
  { id: 3, name: 'Alan Turing', role: 'Scientist', score: 88 },
  { id: 4, name: 'Katherine Johnson', role: 'Mathematician', score: 93 },
]

const sortField = ref<string | null>('score')
const sortOrder = ref<1 | -1 | 0 | null>(-1)
</script>

<template>
  <Table
    :value="rows"
    data-key="id"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
  >
    <TableColumn field="name" header="Name" sortable />
    <TableColumn field="role" header="Role" sortable />
    <TableColumn field="score" header="Score" sortable align="right" />
  </Table>
</template>
