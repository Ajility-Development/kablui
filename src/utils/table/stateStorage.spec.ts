import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  canUseWebStorage,
  clearTableState,
  getTableStateStorage,
  keysToSelection,
  loadTableState,
  normalizeTableState,
  saveTableState,
  selectionToKeys,
  TABLE_STATE_MAX_COLUMN_KEYS,
  TABLE_STATE_MAX_FILTER_CONSTRAINTS,
  TABLE_STATE_MAX_MULTI_SORT,
} from './stateStorage'
import type { TablePersistedState } from './types'

const KEY = 'kablui-table-state-test'

afterEach(() => {
  sessionStorage.removeItem(KEY)
  localStorage.removeItem(KEY)
  vi.restoreAllMocks()
})

describe('canUseWebStorage / getTableStateStorage', () => {
  it('reports storage available in jsdom', () => {
    expect(canUseWebStorage()).toBe(true)
    expect(getTableStateStorage('session')).toBe(window.sessionStorage)
    expect(getTableStateStorage('local')).toBe(window.localStorage)
  })

  it('defaults to session storage', () => {
    expect(getTableStateStorage()).toBe(window.sessionStorage)
  })
})

describe('saveTableState / loadTableState / clearTableState', () => {
  it('round-trips a persisted snapshot via session storage', () => {
    const state: TablePersistedState = {
      page: 2,
      sortField: 'name',
      sortOrder: -1,
      multiSortMeta: [{ field: 'name', order: -1 }],
      filters: { name: { value: 'Ada', matchMode: 'contains' } },
      selectionKeys: ['1', '3'],
      columnOrder: ['role', 'name'],
      hiddenColumns: ['role'],
    }
    expect(saveTableState(KEY, state, 'session')).toBe(true)
    expect(loadTableState(KEY, 'session')).toEqual(state)
  })

  it('uses local storage when requested', () => {
    expect(saveTableState(KEY, { page: 3 }, 'local')).toBe(true)
    expect(sessionStorage.getItem(KEY)).toBeNull()
    expect(loadTableState(KEY, 'local')).toEqual({ page: 3 })
  })

  it('returns null for missing or empty keys', () => {
    expect(loadTableState(KEY)).toBeNull()
    expect(loadTableState('')).toBeNull()
    expect(saveTableState('', { page: 1 })).toBe(false)
  })

  it('clears invalid JSON and returns null', () => {
    sessionStorage.setItem(KEY, '{not-json')
    expect(loadTableState(KEY)).toBeNull()
    expect(sessionStorage.getItem(KEY)).toBeNull()
  })

  it('clears non-object JSON and returns null', () => {
    sessionStorage.setItem(KEY, '"string"')
    expect(loadTableState(KEY)).toBeNull()
    sessionStorage.setItem(KEY, '[]')
    expect(loadTableState(KEY)).toBeNull()
  })

  it('revives ISO date strings inside filters', () => {
    const iso = '2024-01-15T12:00:00.000Z'
    saveTableState(KEY, {
      filters: { joined: { value: iso, matchMode: 'dateIs' } },
    })
    const loaded = loadTableState(KEY)
    expect(loaded?.filters?.joined).toMatchObject({ matchMode: 'dateIs' })
    expect((loaded?.filters?.joined as { value: Date }).value).toBeInstanceOf(Date)
  })

  it('clearTableState removes the entry', () => {
    saveTableState(KEY, { page: 1 })
    expect(clearTableState(KEY)).toBe(true)
    expect(loadTableState(KEY)).toBeNull()
  })

  it('returns false / null when Storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(saveTableState(KEY, { page: 1 })).toBe(false)
    expect(loadTableState(KEY)).toBeNull()
  })
})

describe('normalizeTableState', () => {
  it('returns null for non-objects', () => {
    expect(normalizeTableState(null)).toBeNull()
    expect(normalizeTableState(undefined)).toBeNull()
    expect(normalizeTableState('string')).toBeNull()
    expect(normalizeTableState(42)).toBeNull()
    expect(normalizeTableState([])).toBeNull()
  })

  it('keeps a valid snapshot and drops unknown keys', () => {
    const normalized = normalizeTableState({
      page: 2,
      sortField: 'name',
      sortOrder: -1,
      multiSortMeta: [{ field: 'name', order: -1 }],
      filters: { name: { value: 'Ada', matchMode: 'contains' } },
      selectionKeys: ['1', '3'],
      columnOrder: ['role', 'name'],
      hiddenColumns: ['role'],
      evil: true,
      __proto__: { polluted: true },
    })
    expect(normalized).toEqual({
      page: 2,
      sortField: 'name',
      sortOrder: -1,
      multiSortMeta: [{ field: 'name', order: -1 }],
      filters: { name: { value: 'Ada', matchMode: 'contains' } },
      selectionKeys: ['1', '3'],
      columnOrder: ['role', 'name'],
      hiddenColumns: ['role'],
    })
    expect(normalized).not.toHaveProperty('evil')
  })

  it('rejects invalid page values without clamping to pageCount', () => {
    expect(normalizeTableState({ page: 0 })).toEqual({})
    expect(normalizeTableState({ page: -3 })).toEqual({})
    expect(normalizeTableState({ page: Number.NaN })).toEqual({})
    expect(normalizeTableState({ page: Number.POSITIVE_INFINITY })).toEqual({})
    expect(normalizeTableState({ page: 1.9 })).toEqual({ page: 1 })
    expect(normalizeTableState({ page: 9999 })).toEqual({ page: 9999 })
  })

  it('validates sortField / sortOrder and multiSortMeta entries', () => {
    expect(
      normalizeTableState({
        sortField: 12,
        sortOrder: 2,
        multiSortMeta: [
          { field: 'ok', order: 1 },
          { field: '', order: 1 },
          { field: 'bad', order: 5 },
          null,
          'x',
        ],
      }),
    ).toEqual({
      multiSortMeta: [{ field: 'ok', order: 1 }],
    })
    expect(normalizeTableState({ sortField: null, sortOrder: null })).toEqual({
      sortField: null,
      sortOrder: null,
    })
  })

  it('drops filters with bad matchMode or invalid shape', () => {
    const normalized = normalizeTableState({
      filters: {
        good: { value: 'a', matchMode: 'contains' },
        badMode: { value: 'a', matchMode: 'toString' },
        missingMode: { value: 'a' },
        advanced: {
          operator: 'or',
          constraints: [
            { value: 1, matchMode: 'equals' },
            { value: 2, matchMode: 'valueOf' },
            { value: 3, matchMode: 'gt' },
          ],
        },
        emptyAdvanced: { operator: 'and', constraints: [] },
        __proto__: { value: 'x', matchMode: 'contains' },
        constructor: { value: 'x', matchMode: 'contains' },
      },
    })
    expect(normalized).toEqual({
      filters: {
        good: { value: 'a', matchMode: 'contains' },
        advanced: {
          operator: 'or',
          constraints: [
            { value: 1, matchMode: 'equals' },
            { value: 3, matchMode: 'gt' },
          ],
        },
      },
    })
  })

  it('caps oversized arrays', () => {
    const multiSortMeta = Array.from({ length: TABLE_STATE_MAX_MULTI_SORT + 5 }, (_, i) => ({
      field: `f${i}`,
      order: 1 as const,
    }))
    const columnOrder = Array.from(
      { length: TABLE_STATE_MAX_COLUMN_KEYS + 3 },
      (_, i) => `c${i}`,
    )
    const hiddenColumns = Array.from(
      { length: TABLE_STATE_MAX_COLUMN_KEYS + 1 },
      (_, i) => `h${i}`,
    )
    const constraints = Array.from(
      { length: TABLE_STATE_MAX_FILTER_CONSTRAINTS + 4 },
      (_, i) => ({ value: i, matchMode: 'equals' as const }),
    )

    const normalized = normalizeTableState({
      multiSortMeta,
      columnOrder,
      hiddenColumns,
      filters: { name: { operator: 'and', constraints } },
    })

    expect(normalized?.multiSortMeta).toHaveLength(TABLE_STATE_MAX_MULTI_SORT)
    expect(normalized?.columnOrder).toHaveLength(TABLE_STATE_MAX_COLUMN_KEYS)
    expect(normalized?.hiddenColumns).toHaveLength(TABLE_STATE_MAX_COLUMN_KEYS)
    expect(
      (normalized?.filters?.name as { constraints: unknown[] }).constraints,
    ).toHaveLength(TABLE_STATE_MAX_FILTER_CONSTRAINTS)
  })

  it('can sanitize payloads returned by loadTableState', () => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        page: -1,
        sortField: 'name',
        filters: { name: { value: 'x', matchMode: 'toString' } },
        columnOrder: ['a', 2, null, 'b'],
        unknown: 1,
      }),
    )
    const loaded = loadTableState(KEY)
    expect(normalizeTableState(loaded)).toEqual({
      sortField: 'name',
      columnOrder: ['a', 'b'],
    })
  })
})

describe('selectionToKeys / keysToSelection', () => {
  const rows = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' },
    { id: 3, name: 'Alan' },
  ]

  it('extracts keys from single and multiple selection', () => {
    expect(selectionToKeys(rows[0], 'id')).toEqual(['1'])
    expect(selectionToKeys([rows[0], rows[2]], 'id')).toEqual(['1', '3'])
  })

  it('returns undefined without dataKey or selection', () => {
    expect(selectionToKeys(rows[0], undefined)).toBeUndefined()
    expect(selectionToKeys(null, 'id')).toBeUndefined()
    expect(selectionToKeys([], 'id')).toBeUndefined()
  })

  it('restores single selection by default', () => {
    expect(keysToSelection(['2'], rows, 'id')).toEqual(rows[1])
  })

  it('restores multiple selection when mode is multiple', () => {
    expect(keysToSelection(['1', '3'], rows, 'id', 'multiple')).toEqual([
      rows[0],
      rows[2],
    ])
  })

  it('returns undefined when no keys match current rows', () => {
    expect(keysToSelection(['99'], rows, 'id')).toBeUndefined()
    expect(keysToSelection([], rows, 'id')).toBeUndefined()
  })
})
