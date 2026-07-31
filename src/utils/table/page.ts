/**
 * Client-side page slicing for Table.
 * Pipeline stage: filter → sort → group → page → render
 * Pages are 1-based to match Pagination / `v-model:page`.
 */

/** Slice `rows` to the window for `page` (1-based) and `rowsPerPage`. */
export function pageRows<T>(rows: readonly T[], page: number, rowsPerPage: number): T[] {
  const size = Math.floor(rowsPerPage)
  if (size < 1) return [...rows]

  const safePage = Math.max(1, Math.floor(page))
  const start = (safePage - 1) * size
  return rows.slice(start, start + size)
}

/**
 * Total page count from record count and page size.
 * Returns `0` when there are no records or size is invalid.
 */
export function pageCount(totalRecords: number, rowsPerPage: number): number {
  const size = Math.floor(rowsPerPage)
  const total = Math.max(0, Math.floor(totalRecords))
  if (size < 1 || total === 0) return 0
  return Math.ceil(total / size)
}
