import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  canUseWebStorage,
  clearTableState,
  getTableStateStorage,
  keysToSelection,
  loadTableState,
  saveTableState,
  selectionToKeys,
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
