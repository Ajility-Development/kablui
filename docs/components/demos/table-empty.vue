<script setup lang="ts">
import { Empty, Table, TableColumn } from 'kablui'
</script>

<template>
  <Table :value="[]" data-key="id">
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
    <template #empty>
      <Empty title="No people yet">
        Add a row to get started.
      </Empty>
    </template>
  </Table>
</template>
