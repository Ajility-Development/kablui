<script setup lang="ts">
import { ref } from 'vue'
import { Table, TableColumn } from 'kablui'

const rows = ref([
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Scientist' },
  { id: 4, name: 'Katherine Johnson', role: 'Mathematician' },
])

function onRowReorder(event: { value: unknown[] }) {
  rows.value = event.value as typeof rows.value
}
</script>

<template>
  <Table
    :value="rows"
    data-key="id"
    reorderable-rows
    show-gridlines
    @row-reorder="onRowReorder"
  >
    <TableColumn row-reorder header-style="width: 3rem" :reorderable-column="false" />
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
  </Table>
</template>
