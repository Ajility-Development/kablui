/**
 * Row grouping helpers for Table.
 * Pipeline stage: filter → sort → group → page → render
 *
 * Pagination strategy: cluster sorted data rows by `groupRowsBy`, page those
 * flat data rows, then re-derive group boundaries (headers / rowspan) for the
 * current page slice. Group chrome is not counted as page units.
 */

import { resolveFieldValue } from './filter'
import type { TableRowGroupMode } from './types'

export type { TableRowGroupMode }

/** One contiguous group of rows sharing a group-field value. */
export interface TableRowGroup {
  /** String key for maps / test ids (stable stringify of `value`). */
  key: string
  /** Raw group field value. */
  value: unknown
  /** Member rows in pipeline order. */
  rows: unknown[]
  /** Index of the first row in the flat clustered array. */
  startIndex: number
}

/** Per-row rowspan metadata for `rowGroupMode="rowspan"`. */
export interface TableRowspanMeta {
  groupKey: string
  groupValue: unknown
  groupSize: number
  /** `true` when this row starts a visible group segment. */
  isFirst: boolean
  /**
   * Rowspan for the group cell on this row.
   * `0` means the cell is covered by a previous rowspan (omit from DOM).
   */
  rowspan: number
}

/** Resolve group field (supports nested paths via `a.b`). */
export function getGroupFieldValue(row: unknown, field: string): unknown {
  return resolveFieldValue(row, field)
}

/** Stable string key for a group value (used in models / aria ids). */
export function groupValueKey(value: unknown): string {
  if (value == null) return String(value)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

/**
 * Partition consecutive rows that share the same group field value.
 * Does not reorder — callers should cluster first when needed.
 */
export function partitionRowGroups(
  rows: readonly unknown[],
  field: string,
): TableRowGroup[] {
  if (!field || rows.length === 0) return []

  const groups: TableRowGroup[] = []
  let current: TableRowGroup | null = null

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const value = getGroupFieldValue(row, field)
    const key = groupValueKey(value)

    if (!current || current.key !== key) {
      current = { key, value, rows: [row], startIndex: i }
      groups.push(current)
    } else {
      current.rows.push(row)
    }
  }

  return groups
}

/**
 * Stable cluster: group rows by field value in first-seen order,
 * preserving relative order within each group.
 */
export function clusterRowsByGroupField(
  rows: readonly unknown[],
  field: string,
): unknown[] {
  if (!field || rows.length === 0) return [...rows]

  const order: string[] = []
  const buckets = new Map<string, unknown[]>()

  for (const row of rows) {
    const key = groupValueKey(getGroupFieldValue(row, field))
    if (!buckets.has(key)) {
      buckets.set(key, [])
      order.push(key)
    }
    buckets.get(key)!.push(row)
  }

  const out: unknown[] = []
  for (const key of order) {
    out.push(...(buckets.get(key) ?? []))
  }
  return out
}

/**
 * Client group stage: when `field` is set, return clustered rows; otherwise
 * return a shallow copy of `rows`.
 */
export function groupRows(
  rows: readonly unknown[],
  field: string | undefined | null,
): unknown[] {
  if (!field) return [...rows]
  return clusterRowsByGroupField(rows, field)
}

/**
 * Rowspan metadata for a contiguous row list (e.g. current page).
 * Partial groups at page edges get rowspan for the visible segment only.
 */
export function computeRowspanMeta(
  rows: readonly unknown[],
  field: string,
): TableRowspanMeta[] {
  if (!field || rows.length === 0) return []

  const groups = partitionRowGroups(rows, field)
  const meta: TableRowspanMeta[] = new Array(rows.length)

  for (const group of groups) {
    const size = group.rows.length
    for (let i = 0; i < size; i++) {
      const index = group.startIndex + i
      meta[index] = {
        groupKey: group.key,
        groupValue: group.value,
        groupSize: size,
        isFirst: i === 0,
        rowspan: i === 0 ? size : 0,
      }
    }
  }

  return meta
}

/** Whether `expandedRowGroups` contains a group value. */
export function isRowGroupExpanded(
  expandedRowGroups: readonly unknown[] | null | undefined,
  groupValue: unknown,
): boolean {
  if (!expandedRowGroups || expandedRowGroups.length === 0) return false
  const key = groupValueKey(groupValue)
  return expandedRowGroups.some((item) => groupValueKey(item) === key)
}

/**
 * Toggle a group value in `expandedRowGroups`.
 * Returns a new array (does not mutate).
 */
export function toggleRowGroupExpanded(
  expandedRowGroups: readonly unknown[] | null | undefined,
  groupValue: unknown,
): { next: unknown[]; expanded: boolean } {
  const current = [...(expandedRowGroups ?? [])]
  const key = groupValueKey(groupValue)
  const index = current.findIndex((item) => groupValueKey(item) === key)
  if (index === -1) {
    current.push(groupValue)
    return { next: current, expanded: true }
  }
  current.splice(index, 1)
  return { next: current, expanded: false }
}

export type TableExpandedRowsModel = Record<string, boolean> | unknown[]

/** Whether a data row is expanded given `expandedRows` + optional dataKey. */
export function isRowExpanded(
  expandedRows: TableExpandedRowsModel | null | undefined,
  row: unknown,
  dataKey: string | undefined,
  rowEquals: (a: unknown, b: unknown) => boolean,
): boolean {
  if (expandedRows == null) return false

  if (Array.isArray(expandedRows)) {
    return expandedRows.some((item) => rowEquals(item, row))
  }

  if (dataKey && row && typeof row === 'object') {
    const key = (row as Record<string, unknown>)[dataKey]
    if (key != null) return !!expandedRows[String(key)]
  }

  return false
}

/**
 * Toggle row expansion. Prefer object map when `dataKey` is set;
 * otherwise use an array of row references.
 */
export function toggleRowExpanded(
  expandedRows: TableExpandedRowsModel | null | undefined,
  row: unknown,
  dataKey: string | undefined,
  rowEquals: (a: unknown, b: unknown) => boolean,
): { next: TableExpandedRowsModel; expanded: boolean } {
  if (dataKey && row && typeof row === 'object') {
    const key = (row as Record<string, unknown>)[dataKey]
    if (key != null) {
      const map: Record<string, boolean> =
        expandedRows && !Array.isArray(expandedRows) ? { ...expandedRows } : {}
      const k = String(key)
      const was = !!map[k]
      if (was) {
        delete map[k]
        return { next: map, expanded: false }
      }
      map[k] = true
      return { next: map, expanded: true }
    }
  }

  const list = Array.isArray(expandedRows) ? [...expandedRows] : []
  const index = list.findIndex((item) => rowEquals(item, row))
  if (index === -1) {
    list.push(row)
    return { next: list, expanded: true }
  }
  list.splice(index, 1)
  return { next: list, expanded: false }
}
