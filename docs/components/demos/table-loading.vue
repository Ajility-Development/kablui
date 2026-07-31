<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Skeleton, Table, TableColumn } from 'kablui'

const loading = ref(true)

const rows = [
  { id: 1, name: 'Ada', role: 'Engineer' },
  { id: 2, name: 'Grace', role: 'Admiral' },
]

/** Exclusive loading: empty value while loading so rows are not shown under the mask. */
const value = computed(() => (loading.value ? [] : rows))

function toggle() {
  loading.value = !loading.value
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div>
      <Button size="sm" variant="outline" @click="toggle">
        {{ loading ? 'Show data' : 'Show loading' }}
      </Button>
    </div>
    <Table :value="value" data-key="id" :loading="loading">
      <TableColumn field="name" header="Name" />
      <TableColumn field="role" header="Role" />
      <template #loading>
        <div class="flex w-full flex-col gap-2 px-4 py-6">
          <Skeleton height="1rem" />
          <Skeleton height="1rem" width="80%" />
          <Skeleton height="1rem" width="60%" />
        </div>
      </template>
    </Table>
  </div>
</template>
