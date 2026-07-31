import { FilterMatchMode, FilterOperator } from './filter'
import type {
  TableFilterConstraint,
  TableFilterMatchMode,
  TableFilterMeta,
  TableFilterOperator,
  TableFilters,
  TablePersistedState,
  TableSortMeta,
  TableSortOrder,
  TableStateStorage,
} from './types'

export type { TablePersistedState, TableStateStorage }

/** Caps for arrays restored from storage (DoS / UI integrity). */
export const TABLE_STATE_MAX_MULTI_SORT = 32
export const TABLE_STATE_MAX_COLUMN_KEYS = 256
export const TABLE_STATE_MAX_SELECTION_KEYS = 10_000
export const TABLE_STATE_MAX_FILTER_FIELDS = 256
export const TABLE_STATE_MAX_FILTER_CONSTRAINTS = 32

const ALLOWED_MATCH_MODES = new Set<string>(Object.values(FilterMatchMode))
const ALLOWED_OPERATORS = new Set<string>(Object.values(FilterOperator))
const ALLOWED_SORT_ORDERS = new Set<number>([1, -1, 0])

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

/** True when `window` / Web Storage APIs are available (false under SSR). */
export function canUseWebStorage(): boolean {
  return typeof window !== 'undefined' && typeof Storage !== 'undefined'
}

/**
 * Resolve the Storage backend for a stateful table.
 * Returns `null` when storage is unavailable (SSR / no window).
 */
export function getTableStateStorage(
  kind: TableStateStorage = 'session',
): Storage | null {
  if (!canUseWebStorage()) return null
  try {
    if (kind === 'local') return window.localStorage
    return window.sessionStorage
  } catch {
    // Private mode / blocked storage
    return null
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/

function reviveDates(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && ISO_DATE.test(value)) {
    return new Date(value)
  }
  return value
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isAllowedMatchMode(value: unknown): value is TableFilterMatchMode {
  return typeof value === 'string' && ALLOWED_MATCH_MODES.has(value)
}

function isAllowedOperator(value: unknown): value is TableFilterOperator {
  return typeof value === 'string' && ALLOWED_OPERATORS.has(value)
}

function isSortOrder(value: unknown): value is TableSortOrder {
  return typeof value === 'number' && ALLOWED_SORT_ORDERS.has(value)
}

function isSafeKey(key: string): boolean {
  return key.length > 0 && !DANGEROUS_KEYS.has(key)
}

function takeStringArray(value: unknown, max: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const out: string[] = []
  for (const item of value) {
    if (out.length >= max) break
    if (typeof item !== 'string' || !isSafeKey(item)) continue
    out.push(item)
  }
  return out
}

function normalizeSortMeta(value: unknown): TableSortMeta | null {
  if (!isPlainObject(value)) return null
  const field = value.field
  const order = value.order
  if (typeof field !== 'string' || !isSafeKey(field) || !isSortOrder(order)) {
    return null
  }
  return { field, order }
}

function normalizeConstraint(value: unknown): TableFilterConstraint | null {
  if (!isPlainObject(value)) return null
  if (!isAllowedMatchMode(value.matchMode)) return null
  if (!('value' in value)) return null
  return { value: value.value, matchMode: value.matchMode }
}

function normalizeFilterMeta(value: unknown): TableFilterMeta | null {
  if (!isPlainObject(value)) return null

  if (Array.isArray(value.constraints)) {
    const operator = isAllowedOperator(value.operator)
      ? value.operator
      : FilterOperator.AND
    const constraints: TableFilterConstraint[] = []
    for (const item of value.constraints) {
      if (constraints.length >= TABLE_STATE_MAX_FILTER_CONSTRAINTS) break
      const c = normalizeConstraint(item)
      if (c) constraints.push(c)
    }
    if (constraints.length === 0) return null
    return { operator, constraints }
  }

  if (!isAllowedMatchMode(value.matchMode)) return null
  if (!('value' in value)) return null
  return { value: value.value, matchMode: value.matchMode }
}

function normalizeFilters(value: unknown): TableFilters | undefined {
  if (!isPlainObject(value)) return undefined
  const out: TableFilters = {}
  let count = 0
  for (const [key, meta] of Object.entries(value)) {
    if (count >= TABLE_STATE_MAX_FILTER_FIELDS) break
    if (!isSafeKey(key)) continue
    const normalized = normalizeFilterMeta(meta)
    if (!normalized) continue
    out[key] = normalized
    count += 1
  }
  return Object.keys(out).length ? out : undefined
}

/**
 * Validate and sanitize a persisted table-state payload.
 * Returns `null` when `raw` is not a plain object.
 * Unknown keys and invalid entries are dropped; `page` is not clamped to pageCount.
 */
export function normalizeTableState(raw: unknown): TablePersistedState | null {
  if (!isPlainObject(raw)) return null

  const state: TablePersistedState = {}

  if (typeof raw.page === 'number' && Number.isFinite(raw.page)) {
    const page = Math.floor(raw.page)
    if (page >= 1) state.page = page
  }

  if (raw.sortField === null) {
    state.sortField = null
  } else if (typeof raw.sortField === 'string' && isSafeKey(raw.sortField)) {
    state.sortField = raw.sortField
  }

  if (raw.sortOrder === null) {
    state.sortOrder = null
  } else if (isSortOrder(raw.sortOrder)) {
    state.sortOrder = raw.sortOrder
  }

  if (Array.isArray(raw.multiSortMeta)) {
    const meta: TableSortMeta[] = []
    for (const item of raw.multiSortMeta) {
      if (meta.length >= TABLE_STATE_MAX_MULTI_SORT) break
      const entry = normalizeSortMeta(item)
      if (entry) meta.push(entry)
    }
    state.multiSortMeta = meta
  }

  const filters = normalizeFilters(raw.filters)
  if (filters) state.filters = filters

  const selectionKeys = takeStringArray(raw.selectionKeys, TABLE_STATE_MAX_SELECTION_KEYS)
  if (selectionKeys) state.selectionKeys = selectionKeys

  const columnOrder = takeStringArray(raw.columnOrder, TABLE_STATE_MAX_COLUMN_KEYS)
  if (columnOrder) state.columnOrder = columnOrder

  const hiddenColumns = takeStringArray(raw.hiddenColumns, TABLE_STATE_MAX_COLUMN_KEYS)
  if (hiddenColumns) state.hiddenColumns = hiddenColumns

  return state
}

/** Read and parse persisted table state. Returns `null` when missing or invalid. */
export function loadTableState(
  stateKey: string,
  storageKind: TableStateStorage = 'session',
): TablePersistedState | null {
  if (!stateKey) return null
  const storage = getTableStateStorage(storageKind)
  if (!storage) return null

  let raw: string | null
  try {
    raw = storage.getItem(stateKey)
  } catch {
    return null
  }
  if (raw == null || raw === '') return null

  try {
    const parsed = JSON.parse(raw, reviveDates) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      try {
        storage.removeItem(stateKey)
      } catch {
        /* ignore */
      }
      return null
    }
    return parsed as TablePersistedState
  } catch {
    try {
      storage.removeItem(stateKey)
    } catch {
      /* ignore */
    }
    return null
  }
}

/** Persist table state. No-op when storage is unavailable. */
export function saveTableState(
  stateKey: string,
  state: TablePersistedState,
  storageKind: TableStateStorage = 'session',
): boolean {
  if (!stateKey) return false
  const storage = getTableStateStorage(storageKind)
  if (!storage) return false

  try {
    storage.setItem(stateKey, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/** Remove persisted state for a key. */
export function clearTableState(
  stateKey: string,
  storageKind: TableStateStorage = 'session',
): boolean {
  if (!stateKey) return false
  const storage = getTableStateStorage(storageKind)
  if (!storage) return false

  try {
    storage.removeItem(stateKey)
    return true
  } catch {
    return false
  }
}

/**
 * Collect stable selection keys from a selection model using `dataKey`.
 * Returns `undefined` when selection cannot be represented safely (no dataKey / empty).
 */
export function selectionToKeys(
  selection: unknown,
  dataKey: string | undefined,
): string[] | undefined {
  if (!dataKey || selection == null) return undefined

  const rows = Array.isArray(selection) ? selection : [selection]
  const keys: string[] = []
  for (const row of rows) {
    if (row == null || typeof row !== 'object') continue
    const value = (row as Record<string, unknown>)[dataKey]
    if (value == null) continue
    keys.push(String(value))
  }
  return keys.length ? keys : undefined
}

/**
 * Rebuild selection from persisted keys against the current row list.
 * Returns `undefined` when nothing matches (caller should leave selection alone or clear).
 */
export function keysToSelection(
  keys: string[] | undefined,
  rows: unknown[],
  dataKey: string | undefined,
  selectionMode?: 'single' | 'multiple',
): unknown | unknown[] | undefined {
  if (!dataKey || !keys?.length) return undefined

  const keySet = new Set(keys.map(String))
  const matched: unknown[] = []
  for (const row of rows) {
    if (row == null || typeof row !== 'object') continue
    const value = (row as Record<string, unknown>)[dataKey]
    if (value != null && keySet.has(String(value))) {
      matched.push(row)
    }
  }
  if (!matched.length) return undefined

  if (selectionMode === 'multiple' || matched.length > 1) {
    return matched
  }
  return matched[0]
}
