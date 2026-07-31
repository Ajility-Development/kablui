import { describe, expect, it } from 'vitest'
import {
  clusterRowsByGroupField,
  computeRowspanMeta,
  getGroupFieldValue,
  groupRows,
  groupValueKey,
  isRowExpanded,
  isRowGroupExpanded,
  partitionRowGroups,
  toggleRowExpanded,
  toggleRowGroupExpanded,
} from './group'

const people = [
  { id: 1, name: 'Ada', role: 'Engineer', country: { name: 'UK' } },
  { id: 2, name: 'Grace', role: 'Admiral', country: { name: 'US' } },
  { id: 3, name: 'Alan', role: 'Engineer', country: { name: 'UK' } },
  { id: 4, name: 'Katherine', role: 'Mathematician', country: { name: 'US' } },
  { id: 5, name: 'Margaret', role: 'Engineer', country: { name: 'US' } },
]

function rowEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false
  return (a as { id?: unknown }).id === (b as { id?: unknown }).id
}

describe('getGroupFieldValue', () => {
  it('reads top-level and nested fields', () => {
    expect(getGroupFieldValue(people[0], 'role')).toBe('Engineer')
    expect(getGroupFieldValue(people[0], 'country.name')).toBe('UK')
  })
})

describe('groupValueKey', () => {
  it('stringifies primitives and nullish', () => {
    expect(groupValueKey('Engineer')).toBe('Engineer')
    expect(groupValueKey(null)).toBe('null')
    expect(groupValueKey(undefined)).toBe('undefined')
  })
})

describe('clusterRowsByGroupField / groupRows', () => {
  it('clusters by first-seen group order and preserves within-group order', () => {
    const clustered = clusterRowsByGroupField(people, 'role')
    expect(clustered.map((r) => (r as { name: string }).name)).toEqual([
      'Ada',
      'Alan',
      'Margaret',
      'Grace',
      'Katherine',
    ])
  })

  it('returns a copy when field is missing', () => {
    const next = groupRows(people, null)
    expect(next).toEqual(people)
    expect(next).not.toBe(people)
  })
})

describe('partitionRowGroups', () => {
  it('partitions consecutive equal group values', () => {
    const clustered = clusterRowsByGroupField(people, 'role')
    const groups = partitionRowGroups(clustered, 'role')
    expect(groups.map((g) => g.key)).toEqual(['Engineer', 'Admiral', 'Mathematician'])
    expect(groups[0].rows).toHaveLength(3)
    expect(groups[0].startIndex).toBe(0)
    expect(groups[1].startIndex).toBe(3)
  })
})

describe('computeRowspanMeta', () => {
  it('assigns rowspan on first row and 0 on following rows', () => {
    const clustered = clusterRowsByGroupField(people, 'role')
    const meta = computeRowspanMeta(clustered, 'role')
    expect(meta[0]).toMatchObject({ isFirst: true, rowspan: 3, groupKey: 'Engineer' })
    expect(meta[1]).toMatchObject({ isFirst: false, rowspan: 0 })
    expect(meta[2]).toMatchObject({ isFirst: false, rowspan: 0 })
    expect(meta[3]).toMatchObject({ isFirst: true, rowspan: 1, groupKey: 'Admiral' })
  })

  it('handles partial page segments', () => {
    const page = [
      { id: 3, role: 'Engineer' },
      { id: 5, role: 'Engineer' },
      { id: 2, role: 'Admiral' },
    ]
    const meta = computeRowspanMeta(page, 'role')
    expect(meta[0].rowspan).toBe(2)
    expect(meta[1].rowspan).toBe(0)
    expect(meta[2].rowspan).toBe(1)
  })
})

describe('expanded row groups', () => {
  it('checks and toggles group expansion by value', () => {
    expect(isRowGroupExpanded(['Engineer'], 'Engineer')).toBe(true)
    expect(isRowGroupExpanded(['Engineer'], 'Admiral')).toBe(false)

    const opened = toggleRowGroupExpanded([], 'Engineer')
    expect(opened.expanded).toBe(true)
    expect(opened.next).toEqual(['Engineer'])

    const closed = toggleRowGroupExpanded(opened.next, 'Engineer')
    expect(closed.expanded).toBe(false)
    expect(closed.next).toEqual([])
  })
})

describe('expanded rows', () => {
  it('supports object map keyed by dataKey', () => {
    expect(isRowExpanded({ '1': true }, people[0], 'id', rowEquals)).toBe(true)
    expect(isRowExpanded({ '1': true }, people[1], 'id', rowEquals)).toBe(false)

    const opened = toggleRowExpanded({}, people[0], 'id', rowEquals)
    expect(opened.expanded).toBe(true)
    expect(opened.next).toEqual({ '1': true })

    const closed = toggleRowExpanded(opened.next, people[0], 'id', rowEquals)
    expect(closed.expanded).toBe(false)
    expect(closed.next).toEqual({})
  })

  it('supports array of row refs when dataKey is absent', () => {
    const opened = toggleRowExpanded([], people[0], undefined, rowEquals)
    expect(opened.expanded).toBe(true)
    expect(isRowExpanded(opened.next, people[0], undefined, rowEquals)).toBe(true)

    const closed = toggleRowExpanded(opened.next, people[0], undefined, rowEquals)
    expect(closed.expanded).toBe(false)
    expect(isRowExpanded(closed.next, people[0], undefined, rowEquals)).toBe(false)
  })
})
