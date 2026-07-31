<script setup lang="ts">
import { Table, TableColumn, TableColumnGroup, TableHeaderRow } from 'kablui'

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
]

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
</script>

<template>
  <Table :value="rows" data-key="id" show-gridlines>
    <!--
      Leaf columns (with `field`) are body columns.
      Chrome cells omit `field` and use colspan / rowspan only.
    -->
    <TableColumnGroup type="header">
      <TableHeaderRow>
        <TableColumn header="Product" field="product" :rowspan="3" />
        <TableColumn header="Sale Rate" :colspan="4" />
      </TableHeaderRow>
      <TableHeaderRow>
        <TableColumn header="Sales" :colspan="2" />
        <TableColumn header="Profits" :colspan="2" />
      </TableHeaderRow>
      <TableHeaderRow>
        <TableColumn field="lastYearSale" header="Last Year">
          <template #body="{ data }">{{ data.lastYearSale }}%</template>
        </TableColumn>
        <TableColumn field="thisYearSale" header="This Year">
          <template #body="{ data }">{{ data.thisYearSale }}%</template>
        </TableColumn>
        <TableColumn field="lastYearProfit" header="Last Year">
          <template #body="{ data }">{{ formatCurrency(data.lastYearProfit) }}</template>
        </TableColumn>
        <TableColumn field="thisYearProfit" header="This Year">
          <template #body="{ data }">{{ formatCurrency(data.thisYearProfit) }}</template>
        </TableColumn>
      </TableHeaderRow>
    </TableColumnGroup>
  </Table>
</template>
