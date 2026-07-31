import { describe, expect, it } from 'vitest'
import {
  ariaSortValue,
  compareValues,
  getFieldSortOrder,
  getFieldValue,
  getMultiSortBadgeIndex,
  sortRows,
  toggleSort,
} from './sort'

const people = [
  { id: 1, name: 'Ada', role: 'Engineer', score: 90 },
  { id: 2, name: 'Grace', role: 'Admiral', score: 95 },
  { id: 3, name: 'Alan', role: 'Scientist', score: 88 },
  { id: 4, name: 'Grace', role: 'Engineer', score: 92 },
]

describe('getFieldValue', () => {
  it('reads a top-level field', () => {
    expect(getFieldValue({ name: 'Ada' }, 'name')).toBe('Ada')
  })

  it('reads nested paths', () => {
    expect(getFieldValue({ country: { name: 'UK' } }, 'country.name')).toBe('UK')
  })

  it('returns undefined for non-objects', () => {
    expect(getFieldValue(null, 'name')).toBeUndefined()
    expect(getFieldValue('x', 'name')).toBeUndefined()
  })
})

describe('compareValues', () => {
  it('compares strings with localeCompare', () => {
    expect(compareValues('a', 'b', 1)).toBeLessThan(0)
    expect(compareValues('a', 'b', -1)).toBeGreaterThan(0)
  })

  it('compares numbers', () => {
    expect(compareValues(1, 2, 1)).toBeLessThan(0)
    expect(compareValues(2, 1, 1)).toBeGreaterThan(0)
  })

  it('treats order 0 / null as equal', () => {
    expect(compareValues(1, 2, 0)).toBe(0)
    expect(compareValues(1, 2, null)).toBe(0)
  })

  it('orders nullish values using nullSortOrder', () => {
    expect(compareValues(null, 1, 1, 1)).toBeGreaterThan(0)
    expect(compareValues(null, 1, 1, -1)).toBeLessThan(0)
  })
})

describe('sortRows', () => {
  it('returns a copy when unsorted', () => {
    const result = sortRows(people)
    expect(result).toEqual(people)
    expect(result).not.toBe(people)
  })

  it('sorts single field ascending and descending', () => {
    const asc = sortRows(people, { sortField: 'name', sortOrder: 1 })
    expect(asc.map((p) => p.name)).toEqual(['Ada', 'Alan', 'Grace', 'Grace'])

    const desc = sortRows(people, { sortField: 'name', sortOrder: -1 })
    expect(desc.map((p) => p.name)).toEqual(['Grace', 'Grace', 'Alan', 'Ada'])
  })

  it('preserves row object identity', () => {
    const sorted = sortRows(people, { sortField: 'score', sortOrder: 1 })
    expect(sorted[0]).toBe(people[2])
  })

  it('applies multi-sort meta in order', () => {
    const sorted = sortRows(people, {
      sortMode: 'multiple',
      multiSortMeta: [
        { field: 'name', order: 1 },
        { field: 'score', order: -1 },
      ],
    })
    expect(sorted.map((p) => p.id)).toEqual([1, 3, 2, 4])
  })

  it('is stable for equal keys', () => {
    const rows = [
      { id: 'a', group: 1 },
      { id: 'b', group: 1 },
      { id: 'c', group: 2 },
    ]
    const sorted = sortRows(rows, { sortField: 'group', sortOrder: 1 })
    expect(sorted.map((r) => r.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('getFieldSortOrder', () => {
  it('reads single-mode order', () => {
    expect(
      getFieldSortOrder('name', { sortMode: 'single', sortField: 'name', sortOrder: -1 }),
    ).toBe(-1)
    expect(getFieldSortOrder('role', { sortMode: 'single', sortField: 'name', sortOrder: 1 })).toBe(
      0,
    )
  })

  it('reads multi-mode order from meta', () => {
    expect(
      getFieldSortOrder('role', {
        sortMode: 'multiple',
        multiSortMeta: [{ field: 'role', order: 1 }],
      }),
    ).toBe(1)
  })
})

describe('getMultiSortBadgeIndex', () => {
  it('returns 0 when fewer than two active sorts', () => {
    expect(getMultiSortBadgeIndex('name', [{ field: 'name', order: 1 }])).toBe(0)
    expect(getMultiSortBadgeIndex('name', [])).toBe(0)
  })

  it('returns 1-based index when multiple sorts are active', () => {
    const meta: { field: string; order: 1 | -1 | 0 }[] = [
      { field: 'name', order: 1 },
      { field: 'role', order: -1 },
    ]
    expect(getMultiSortBadgeIndex('name', meta)).toBe(1)
    expect(getMultiSortBadgeIndex('role', meta)).toBe(2)
    expect(getMultiSortBadgeIndex('score', meta)).toBe(0)
  })
})

describe('ariaSortValue', () => {
  it('maps order to aria-sort tokens', () => {
    expect(ariaSortValue(1)).toBe('ascending')
    expect(ariaSortValue(-1)).toBe('descending')
    expect(ariaSortValue(0)).toBe('none')
    expect(ariaSortValue(null)).toBe('none')
  })
})

describe('toggleSort', () => {
  it('starts single sort ascending on first click', () => {
    expect(
      toggleSort({ field: 'name', sortMode: 'single' }),
    ).toEqual({
      sortField: 'name',
      sortOrder: 1,
      multiSortMeta: [{ field: 'name', order: 1 }],
    })
  })

  it('toggles single sort between asc and desc', () => {
    expect(
      toggleSort({
        field: 'name',
        sortMode: 'single',
        sortField: 'name',
        sortOrder: 1,
      }),
    ).toEqual({
      sortField: 'name',
      sortOrder: -1,
      multiSortMeta: [{ field: 'name', order: -1 }],
    })
  })

  it('clears single sort on third click when removableSort', () => {
    expect(
      toggleSort({
        field: 'name',
        sortMode: 'single',
        removableSort: true,
        sortField: 'name',
        sortOrder: -1,
      }),
    ).toEqual({
      sortField: null,
      sortOrder: null,
      multiSortMeta: [],
    })
  })

  it('cycles single sort without removableSort', () => {
    expect(
      toggleSort({
        field: 'name',
        sortMode: 'single',
        removableSort: false,
        sortField: 'name',
        sortOrder: -1,
      }),
    ).toEqual({
      sortField: 'name',
      sortOrder: 1,
      multiSortMeta: [{ field: 'name', order: 1 }],
    })
  })

  it('replaces other columns in multi mode without metaKey', () => {
    expect(
      toggleSort({
        field: 'role',
        sortMode: 'multiple',
        multiSortMeta: [{ field: 'name', order: 1 }],
        metaKey: false,
      }),
    ).toEqual({
      sortField: 'role',
      sortOrder: 1,
      multiSortMeta: [{ field: 'role', order: 1 }],
    })
  })

  it('appends column in multi mode with metaKey', () => {
    expect(
      toggleSort({
        field: 'role',
        sortMode: 'multiple',
        multiSortMeta: [{ field: 'name', order: 1 }],
        metaKey: true,
      }),
    ).toEqual({
      sortField: 'name',
      sortOrder: 1,
      multiSortMeta: [
        { field: 'name', order: 1 },
        { field: 'role', order: 1 },
      ],
    })
  })

  it('removes a multi-sort column on third click when removableSort', () => {
    expect(
      toggleSort({
        field: 'name',
        sortMode: 'multiple',
        removableSort: true,
        metaKey: true,
        multiSortMeta: [
          { field: 'name', order: -1 },
          { field: 'role', order: 1 },
        ],
      }),
    ).toEqual({
      sortField: 'role',
      sortOrder: 1,
      multiSortMeta: [{ field: 'role', order: 1 }],
    })
  })
})
