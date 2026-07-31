<script setup lang="ts">
import { ref } from 'vue'
import {
  FilterMatchMode,
  FilterOperator,
  Table,
  TableColumn,
  type TableFilters,
} from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', score: 90 },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', score: 95 },
  { id: 3, name: 'Alan Turing', role: 'Scientist', score: 88 },
  { id: 4, name: 'Katherine Johnson', role: 'Mathematician', score: 92 },
]

const filters = ref<TableFilters>({
  name: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  role: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  score: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
})
</script>

<template>
  <Table
    v-model:filters="filters"
    :value="rows"
    data-key="id"
    filter-display="menu"
  >
    <TableColumn field="name" header="Name" filterable sortable />
    <TableColumn field="role" header="Role" filterable />
    <TableColumn field="score" header="Score" filterable data-type="numeric" sortable />
  </Table>
</template>
