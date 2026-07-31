<script setup lang="ts">
import { ref } from 'vue'
import { FilterMatchMode, Input, Table, TableColumn, type TableFilters } from 'kablui'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', country: 'UK' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', country: 'US' },
  { id: 3, name: 'Alan Turing', role: 'Scientist', country: 'UK' },
  { id: 4, name: 'Katherine Johnson', role: 'Mathematician', country: 'US' },
]

const filters = ref<TableFilters>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

function onGlobalInput(value: string) {
  filters.value = {
    ...filters.value,
    global: {
      value: value === '' ? null : value,
      matchMode: FilterMatchMode.CONTAINS,
    },
  }
}
</script>

<template>
  <Table
    v-model:filters="filters"
    :value="rows"
    data-key="id"
    :global-filter-fields="['name', 'role', 'country']"
  >
    <template #header>
      <Input
        :model-value="String(filters.global?.value ?? '')"
        placeholder="Search name, role, or country"
        size="sm"
        data-testid="table-global-filter"
        @update:model-value="onGlobalInput"
      />
    </template>
    <TableColumn field="name" header="Name" />
    <TableColumn field="role" header="Role" />
    <TableColumn field="country" header="Country" />
  </Table>
</template>
