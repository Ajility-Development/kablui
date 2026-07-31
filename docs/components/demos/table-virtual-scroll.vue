<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Table, TableColumn } from 'kablui'

type Person = { id: number; name: string; role: string; team: string }

const rows = ref<Person[]>([])

onMounted(() => {
  rows.value = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    role: i % 2 === 0 ? 'Engineer' : 'Designer',
    team: ['Platform', 'Design', 'Research'][i % 3],
  }))
})
</script>

<template>
  <Table
    :value="rows"
    data-key="id"
    scroll-height="280px"
    striped
    :virtual-scroller-options="{ itemSize: 40, numToleratedItems: 5 }"
  >
    <TableColumn field="id" header="Id" width="4rem" />
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
    <TableColumn field="team" header="Team" />
  </Table>
</template>
