<script setup lang="ts">
import { ref } from 'vue'
import { Table, TableColumn, type TableSortMeta } from 'kablui'

const rows = [
  { id: 1, name: 'Ada', role: 'Engineer', score: 90 },
  { id: 2, name: 'Grace', role: 'Admiral', score: 95 },
  { id: 3, name: 'Alan', role: 'Scientist', score: 88 },
  { id: 4, name: 'Grace', role: 'Engineer', score: 92 },
  { id: 5, name: 'Ada', role: 'Scientist', score: 91 },
]

const multiSortMeta = ref<TableSortMeta[]>([])
</script>

<template>
  <div class="space-y-2">
    <p class="text-kablui-sm text-kablui-muted-fg">
      Click a header to sort. Hold Ctrl (Windows/Linux) or ⌘ (macOS) while clicking to add
      more columns. Number badges show multi-sort priority.
    </p>
    <Table
      :value="rows"
      data-key="id"
      sort-mode="multiple"
      v-model:multi-sort-meta="multiSortMeta"
    >
      <TableColumn field="name" header="Name" sortable />
      <TableColumn field="role" header="Role" sortable />
      <TableColumn field="score" header="Score" sortable align="right" />
    </Table>
  </div>
</template>
