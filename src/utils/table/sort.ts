import { resolveFieldValue } from './filter'
import type { TableSortMeta, TableSortMode, TableSortOrder } from './types'

export type { TableSortMode }

/** Nested-aware field accessor (alias of `resolveFieldValue`). */
export const getFieldValue = resolveFieldValue

export interface SortRowsOptions {
  sortMode?: TableSortMode
  sortField?: string | null
  sortOrder?: TableSortOrder | null
  multiSortMeta?: TableSortMeta[] | null
  /** When comparing nullish values: positive keeps nulls after non-nulls for ascending. Default `1`. */
  nullSortOrder?: number
}

export interface ToggleSortInput {
  field: string
  sortMode: TableSortMode
  removableSort?: boolean
  /** Ctrl/Cmd held — keep other multi-sort columns. */
  metaKey?: boolean
  sortField?: string | null
  sortOrder?: TableSortOrder | null
  multiSortMeta?: TableSortMeta[] | null
  /** First-click order. Default `1` (ascending). */
  defaultSortOrder?: 1 | -1
}

export interface ToggleSortResult {
  sortField: string | null
  sortOrder: TableSortOrder | null
  multiSortMeta: TableSortMeta[]
}

/**
 * Compare two values for sorting.
 * `order` of `0` or nullish treats values as equal (stable no-op compare).
 */
export function compareValues(
  a: unknown,
  b: unknown,
  order: TableSortOrder | null | undefined,
  nullSortOrder = 1,
): number {
  if (order == null || order === 0) return 0

  const aNull = a == null
  const bNull = b == null
  if (aNull && bNull) return 0
  if (aNull) return nullSortOrder * order
  if (bNull) return -(nullSortOrder * order)

  let result: number
  if (typeof a === 'string' && typeof b === 'string') {
    result = a.localeCompare(b)
  } else if (typeof a === 'number' && typeof b === 'number') {
    result = a === b ? 0 : a > b ? 1 : -1
  } else if (a instanceof Date && b instanceof Date) {
    result = a.getTime() === b.getTime() ? 0 : a > b ? 1 : -1
  } else if (typeof a === 'boolean' && typeof b === 'boolean') {
    result = a === b ? 0 : a ? 1 : -1
  } else {
    const as = String(a)
    const bs = String(b)
    result = as.localeCompare(bs)
  }

  return order * result
}

function activeMultiSortMeta(options: SortRowsOptions): TableSortMeta[] {
  if (options.sortMode === 'multiple') {
    return (options.multiSortMeta ?? []).filter((m) => m.field && m.order)
  }
  if (options.sortField && options.sortOrder) {
    return [{ field: options.sortField, order: options.sortOrder }]
  }
  return []
}

function compareByMeta(
  a: unknown,
  b: unknown,
  meta: TableSortMeta[],
  index: number,
  nullSortOrder: number,
): number {
  if (index >= meta.length) return 0
  const { field, order } = meta[index]!
  const result = compareValues(getFieldValue(a, field), getFieldValue(b, field), order, nullSortOrder)
  if (result !== 0) return result
  return compareByMeta(a, b, meta, index + 1, nullSortOrder)
}

/**
 * Return a sorted copy of `rows` (stable for equal keys via original index).
 * Object identity of each row is preserved.
 */
export function sortRows<T>(rows: readonly T[], options: SortRowsOptions = {}): T[] {
  const meta = activeMultiSortMeta(options)
  if (meta.length === 0) return [...rows]

  const nullSortOrder = options.nullSortOrder ?? 1
  const indexed = rows.map((row, index) => ({ row, index }))
  indexed.sort((x, y) => {
    const result = compareByMeta(x.row, y.row, meta, 0, nullSortOrder)
    return result !== 0 ? result : x.index - y.index
  })
  return indexed.map((entry) => entry.row)
}

/** Current sort order for a field, or `0` when unsorted. */
export function getFieldSortOrder(
  field: string,
  options: Pick<SortRowsOptions, 'sortMode' | 'sortField' | 'sortOrder' | 'multiSortMeta'>,
): TableSortOrder {
  if (options.sortMode === 'multiple') {
    const found = (options.multiSortMeta ?? []).find((m) => m.field === field)
    return found?.order ?? 0
  }
  if (options.sortField === field) return options.sortOrder ?? 0
  return 0
}

/**
 * 1-based multi-sort priority for badges, or `0` when the field is not in the meta
 * / when fewer than two meta entries are active.
 */
export function getMultiSortBadgeIndex(field: string, multiSortMeta?: TableSortMeta[] | null): number {
  const active = (multiSortMeta ?? []).filter((m) => m.field && m.order)
  if (active.length < 2) return 0
  const index = active.findIndex((m) => m.field === field)
  return index === -1 ? 0 : index + 1
}

/** Map sort order to `aria-sort` token. */
export function ariaSortValue(
  order: TableSortOrder | null | undefined,
): 'ascending' | 'descending' | 'none' {
  if (order === 1) return 'ascending'
  if (order === -1) return 'descending'
  return 'none'
}

function toggleOrder(
  current: TableSortOrder | null | undefined,
  removableSort: boolean,
  defaultSortOrder: 1 | -1,
): TableSortOrder | null {
  if (current == null || current === 0) return defaultSortOrder
  const next = (current * -1) as TableSortOrder
  if (removableSort && next === defaultSortOrder) return null
  return next
}

/**
 * Pure next-state for a header sort activation (click / Enter / Space).
 * Mirrors PrimeVue single / multiple + removableSort semantics.
 */
export function toggleSort(input: ToggleSortInput): ToggleSortResult {
  const {
    field,
    sortMode,
    removableSort = false,
    metaKey = false,
    defaultSortOrder = 1,
  } = input

  if (sortMode === 'multiple') {
    let meta = [...(input.multiSortMeta ?? [])]
    if (!metaKey) {
      meta = meta.filter((m) => m.field === field)
    }

    const index = meta.findIndex((m) => m.field === field)
    if (index >= 0) {
      const current = meta[index]!.order
      const next = toggleOrder(current, removableSort, defaultSortOrder)
      if (next == null) meta.splice(index, 1)
      else meta[index] = { field, order: next }
    } else {
      meta.push({ field, order: defaultSortOrder })
    }

    const primary = meta[0]
    return {
      sortField: primary?.field ?? null,
      sortOrder: primary?.order ?? null,
      multiSortMeta: meta,
    }
  }

  // single
  if (input.sortField === field) {
    const next = toggleOrder(input.sortOrder, removableSort, defaultSortOrder)
    if (next == null) {
      return { sortField: null, sortOrder: null, multiSortMeta: [] }
    }
    return {
      sortField: field,
      sortOrder: next,
      multiSortMeta: [{ field, order: next }],
    }
  }

  return {
    sortField: field,
    sortOrder: defaultSortOrder,
    multiSortMeta: [{ field, order: defaultSortOrder }],
  }
}
