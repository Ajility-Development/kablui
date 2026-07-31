<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Table,
  TableColumn,
  type TableFilters,
  type TableLoadEvent,
  type TableSortOrder,
} from 'kablui'

type Person = { id: number; name: string; role: string }

const allRows: Person[] = Array.from({ length: 57 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
}))

const rows = ref<Person[]>([])
const page = ref(1)
const sortField = ref<string | null>(null)
const sortOrder = ref<TableSortOrder | null>(null)
const filters = ref<TableFilters>({})
const loading = ref(false)
const totalRecords = ref(0)

function fetchPage(event: TableLoadEvent) {
  loading.value = true
  // Simulate remote latency
  window.setTimeout(() => {
    let source = [...allRows]
    const nameFilter = filters.value.name
    const q =
      nameFilter && 'value' in nameFilter && nameFilter.value != null
        ? String(nameFilter.value).toLowerCase()
        : ''
    if (q) source = source.filter((r) => r.name.toLowerCase().includes(q))

    if (event.sortField && event.sortOrder) {
      const field = event.sortField as keyof Person
      const dir = event.sortOrder
      source.sort((a, b) => {
        const av = String(a[field] ?? '')
        const bv = String(b[field] ?? '')
        return av < bv ? -dir : av > bv ? dir : 0
      })
    }

    totalRecords.value = source.length
    rows.value = source.slice(event.first, event.first + event.rows)
    loading.value = false
  }, 200)
}

function onLoad(event: TableLoadEvent) {
  fetchPage(event)
}

onMounted(() => {
  fetchPage({
    first: 0,
    rows: 5,
    page: 1,
    pageCount: 0,
    totalRecords: 0,
    sortField: null,
    sortOrder: null,
    multiSortMeta: [],
    filters: {},
  })
})
</script>

<template>
  <Table
    v-model:page="page"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:filters="filters"
    lazy
    paginate
    :rows="5"
    :total-records="totalRecords"
    :value="rows"
    :loading="loading"
    data-key="id"
    filter-display="row"
    @load="onLoad"
  >
    <TableColumn field="name" header="Name" sortable filterable />
    <TableColumn field="role" header="Role" sortable />
  </Table>
</template>
