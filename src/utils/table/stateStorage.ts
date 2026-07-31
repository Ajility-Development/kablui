import type { TablePersistedState, TableStateStorage } from './types'

export type { TablePersistedState, TableStateStorage }

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
