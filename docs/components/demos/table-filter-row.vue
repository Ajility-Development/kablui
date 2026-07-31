<script setup lang="ts">
import { ref } from 'vue'
import { FilterMatchMode, Table, TableColumn, type TableFilters } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Scientist' },
  { id: 4, name: 'Katherine Johnson', role: 'Mathematician' },
]

const filters = ref<TableFilters>({
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  role: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
</script>

<template>
  <Table
    v-model:filters="filters"
    :value="rows"
    data-key="id"
    filter-display="row"
  >
    <TableColumn field="name" header="Name" filterable />
    <TableColumn field="role" header="Role" filterable />
  </Table>
</template>
