import { describe, expect, it } from 'vitest'
import {
  applyColumnOrder,
  canReorderAcrossFreeze,
  columnOrderKey,
  columnOrderKeys,
  nextColumnOrder,
  reorderItems,
} from './reorder'

describe('columnOrderKey', () => {
  it('prefers field over id', () => {
    expect(columnOrderKey({ id: 'col-1', field: 'name' })).toBe('name')
  })

  it('falls back to id', () => {
    expect(columnOrderKey({ id: 'col-1' })).toBe('col-1')
  })
})

describe('reorderItems', () => {
  it('moves an item forward', () => {
    expect(reorderItems(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('moves an item backward', () => {
    expect(reorderItems(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('returns a copy when indices match', () => {
    const items = ['a', 'b']
    const next = reorderItems(items, 1, 1)
    expect(next).toEqual(items)
    expect(next).not.toBe(items)
  })
})

describe('applyColumnOrder', () => {
  const columns = [
    { id: '1', field: 'name' },
    { id: '2', field: 'role' },
    { id: '3', field: 'city' },
  ]

  it('returns registration order when order is empty', () => {
    expect(applyColumnOrder(columns, [])).toEqual(columns)
  })

  it('reorders by field keys', () => {
    expect(applyColumnOrder(columns, ['city', 'name', 'role']).map((c) => c.field)).toEqual([
      'city',
      'name',
      'role',
    ])
  })

  it('appends columns missing from order', () => {
    expect(applyColumnOrder(columns, ['role']).map((c) => c.field)).toEqual([
      'role',
      'name',
      'city',
    ])
  })
})

describe('canReorderAcrossFreeze', () => {
  const columns = [
    { frozen: true },
    { frozen: true },
    { frozen: false },
    { frozen: false },
  ]

  it('allows reorder within frozen', () => {
    expect(canReorderAcrossFreeze(columns, 0, 1)).toBe(true)
  })

  it('allows reorder within unfrozen', () => {
    expect(canReorderAcrossFreeze(columns, 2, 3)).toBe(true)
  })

  it('blocks crossing the freeze boundary', () => {
    expect(canReorderAcrossFreeze(columns, 1, 2)).toBe(false)
    expect(canReorderAcrossFreeze(columns, 3, 0)).toBe(false)
  })
})

describe('nextColumnOrder', () => {
  const columns = [
    { id: '1', field: 'name', frozen: false },
    { id: '2', field: 'role', frozen: false },
    { id: '3', field: 'city', frozen: false },
  ]

  it('returns reordered keys', () => {
    expect(nextColumnOrder(columns, 0, 2)).toEqual(['role', 'city', 'name'])
  })

  it('returns null when freeze boundary is crossed', () => {
    const mixed = [
      { id: '1', field: 'name', frozen: true },
      { id: '2', field: 'role', frozen: false },
    ]
    expect(nextColumnOrder(mixed, 0, 1)).toBeNull()
  })

  it('columnOrderKeys mirrors fields', () => {
    expect(columnOrderKeys(columns)).toEqual(['name', 'role', 'city'])
  })
})
