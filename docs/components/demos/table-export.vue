<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import {
  Button,
  Cluster,
  FilterMatchMode,
  Input,
  Table,
  TableColumn,
  type TableFilters,
} from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', country: 'UK' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', country: 'US' },
  { id: 3, name: 'Alan Turing', role: 'Scientist', country: 'UK' },
  { id: 4, name: 'Katherine Johnson', role: 'Mathematician', country: 'US' },
]

const filters = ref<TableFilters>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const tableRef = useTemplateRef<{ exportCsv: (opts?: object) => string }>('table')

function onGlobalInput(value: string) {
  filters.value = {
    ...filters.value,
    global: {
      value: value === '' ? null : value,
      matchMode: FilterMatchMode.CONTAINS,
    },
  }
}

function downloadCsv() {
  tableRef.value?.exportCsv({ filename: 'people.csv' })
}
</script>

<template>
  <Table
    ref="table"
    v-model:filters="filters"
    :value="rows"
    data-key="id"
    export-filename="people.csv"
    :global-filter-fields="['name', 'role', 'country']"
  >
    <template #header>
      <Cluster gap="sm" class="items-center justify-between">
        <Input
          :model-value="String(filters.global?.value ?? '')"
          placeholder="Filter before export…"
          size="sm"
          data-testid="table-export-global-filter"
          @update:model-value="onGlobalInput"
        />
        <Button size="sm" data-testid="table-export-download" @click="downloadCsv">
          Export CSV
        </Button>
      </Cluster>
    </template>
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
    <TableColumn field="country" header="Country" />
  </Table>
</template>
