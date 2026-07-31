<script setup lang="ts">
import Pagination from '../Pagination.vue'

export interface TablePaginatorProps {
  pageCount: number
  /** Wrapper `data-testid` (default `table-paginator`). */
  testId?: string
  /** Passed through to Pagination root (default `table-pagination`). */
  paginationTestId?: string
  disabled?: boolean
  label?: string
}

withDefaults(defineProps<TablePaginatorProps>(), {
  testId: 'table-paginator',
  paginationTestId: 'table-pagination',
  disabled: false,
  label: 'Table pagination',
})

const page = defineModel<number>('page', { default: 1 })
</script>

<template>
  <div
    data-slot="table-paginator"
    :data-testid="testId"
    class="flex items-center justify-end border-t border-kablui-border px-3 py-2"
  >
    <Pagination
      v-model:page="page"
      :page-count="pageCount"
      :disabled="disabled"
      :label="label"
      :data-testid="paginationTestId"
    />
  </div>
</template>
