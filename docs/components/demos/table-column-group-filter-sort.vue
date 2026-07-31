<script setup lang="ts">
import { ref } from 'vue'
import {
  FilterMatchMode,
  Table,
  TableColumn,
  TableColumnGroup,
  TableHeaderRow,
  type TableFilters,
} from 'kablui'

const rows = [
  {
    id: 1,
    product: 'Bamboo Watch',
    lastYearSale: 51,
    thisYearSale: 40,
    lastYearProfit: 54406,
    thisYearProfit: 43342,
  },
  {
    id: 2,
    product: 'Black Watch',
    lastYearSale: 32,
    thisYearSale: 61,
    lastYearProfit: 24123,
    thisYearProfit: 45821,
  },
  {
    id: 3,
    product: 'Blue Band',
    lastYearSale: 24,
    thisYearSale: 32,
    lastYearProfit: 18234,
    thisYearProfit: 22110,
  },
  {
    id: 4,
    product: 'Blue T-Shirt',
    lastYearSale: 18,
    thisYearSale: 55,
    lastYearProfit: 12000,
    thisYearProfit: 31000,
  },
]

const filters = ref<TableFilters>({
  product: { value: null, matchMode: FilterMatchMode.CONTAINS },
  lastYearSale: { value: null, matchMode: FilterMatchMode.EQUALS },
  thisYearSale: { value: null, matchMode: FilterMatchMode.EQUALS },
})

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
</script>

<template>
  <Table
    v-model:filters="filters"
    :value="rows"
    data-key="id"
    filter-display="menu"
    show-gridlines
  >
    <TableColumnGroup type="header">
      <TableHeaderRow>
        <TableColumn header="Product" field="product" :rowspan="2" sortable filterable />
        <TableColumn header="Performance" :colspan="4" />
      </TableHeaderRow>
      <TableHeaderRow>
        <TableColumn field="lastYearSale" header="LY Sales" sortable filterable>
          <template #body="{ data }">{{ data.lastYearSale }}%</template>
        </TableColumn>
        <TableColumn field="thisYearSale" header="TY Sales" sortable filterable>
          <template #body="{ data }">{{ data.thisYearSale }}%</template>
        </TableColumn>
        <TableColumn field="lastYearProfit" header="LY Profit" sortable>
          <template #body="{ data }">{{ formatCurrency(data.lastYearProfit) }}</template>
        </TableColumn>
        <TableColumn field="thisYearProfit" header="TY Profit" sortable>
          <template #body="{ data }">{{ formatCurrency(data.thisYearProfit) }}</template>
        </TableColumn>
      </TableHeaderRow>
    </TableColumnGroup>
  </Table>
</template>
