<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const rows = [
  {
    id: 1,
    name: 'Ada Lovelace',
    role: 'Mathematician',
    company: 'Analytical Engines',
    city: 'London',
    status: 'Active',
    notes: 'First programmer',
  },
  {
    id: 2,
    name: 'Grace Hopper',
    role: 'Admiral',
    company: 'US Navy',
    city: 'New York',
    status: 'Active',
    notes: 'COBOL pioneer',
  },
  {
    id: 3,
    name: 'Alan Turing',
    role: 'Scientist',
    company: 'Bletchley Park',
    city: 'Manchester',
    status: 'Active',
    notes: 'Computing theory',
  },
]
</script>

<template>
  <!-- Constrained width so wide minWidth columns overflow horizontally. -->
  <div class="max-w-md min-w-0">
    <Table :value="rows" data-key="id">
      <TableColumn field="name" header="Name" min-width="180px" />
      <TableColumn field="role" header="Role" min-width="160px" />
      <TableColumn field="company" header="Company" min-width="200px" />
      <TableColumn field="city" header="City" min-width="160px" />
      <TableColumn field="status" header="Status" min-width="140px" />
      <TableColumn field="notes" header="Notes" min-width="220px" />
    </Table>
  </div>
</template>
