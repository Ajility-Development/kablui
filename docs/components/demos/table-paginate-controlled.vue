<script setup lang="ts">
import { ref } from 'vue'
import { Stack, Table, TableColumn, Text } from 'kablui'

const page = ref(1)

const rows = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
}))
</script>

<template>
  <Stack gap="sm">
    <Text size="sm" tone="muted">Page {{ page }}</Text>
    <Table
      v-model:page="page"
      :value="rows"
      data-key="id"
      paginate
      :rows="5"
    >
      <TableColumn field="name" header="Name" />
      <TableColumn field="role" header="Role" />
    </Table>
  </Stack>
</template>
