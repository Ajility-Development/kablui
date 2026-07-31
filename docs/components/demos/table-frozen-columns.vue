<script setup lang="ts">
import { Table, TableColumn } from 'kablui'

const rows = [
  {
    id: 1,
    name: 'Ada Lovelace',
    idCode: 'A-001',
    country: 'United Kingdom',
    date: '1843-01-01',
    company: 'Analytical Engines',
    status: 'Active',
    balance: '$1,200.00',
  },
  {
    id: 2,
    name: 'Grace Hopper',
    idCode: 'A-002',
    country: 'United States',
    date: '1952-06-01',
    company: 'US Navy',
    status: 'Active',
    balance: '$3,400.00',
  },
  {
    id: 3,
    name: 'Alan Turing',
    idCode: 'A-003',
    country: 'United Kingdom',
    date: '1936-05-28',
    company: 'Bletchley Park',
    status: 'Active',
    balance: '$2,100.00',
  },
  {
    id: 4,
    name: 'Katherine Johnson',
    idCode: 'A-004',
    country: 'United States',
    date: '1962-02-20',
    company: 'NASA',
    status: 'Active',
    balance: '$4,800.00',
  },
]
</script>

<template>
  <!-- Narrow host + tall scrollport so left/right frozen pins are visible while scrolling. -->
  <div class="max-w-md min-w-0">
    <Table :value="rows" data-key="id" scroll-height="220px">
      <TableColumn field="name" header="Name" frozen min-width="160px" />
      <TableColumn field="idCode" header="Id" min-width="100px" />
      <TableColumn field="country" header="Country" min-width="180px" />
      <TableColumn field="date" header="Date" min-width="140px" />
      <TableColumn field="company" header="Company" min-width="200px" />
      <TableColumn field="status" header="Status" min-width="120px" />
      <TableColumn
        field="balance"
        header="Balance"
        frozen
        align-frozen="right"
        min-width="140px"
      />
    </Table>
  </div>
</template>
