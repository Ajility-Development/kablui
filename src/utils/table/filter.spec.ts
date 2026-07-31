import { describe, expect, it } from 'vitest'
import {
  DEFAULT_NUMERIC_MATCH_MODE_OPTIONS,
  DEFAULT_TEXT_MATCH_MODE_OPTIONS,
  FilterMatchMode,
  FilterOperator,
  createEmptyAdvancedFilterMeta,
  filterRows,
  isConstraintActive,
  isFilterMetaAdvanced,
  matchConstraint,
  resolveFieldValue,
} from './filter'
import type { TableFilters } from './types'

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', score: 90, country: { name: 'UK' } },
  { id: 2, name: 'Grace Hopper', role: 'Admiral', score: 95, country: { name: 'US' } },
  { id: 3, name: 'Alan Turing', role: 'Scientist', score: 88, country: { name: 'UK' } },
  { id: 4, name: 'Katherine Johnson', role: 'Mathematician', score: 92, country: { name: 'US' } },
]

describe('resolveFieldValue', () => {
  it('reads top-level and nested paths', () => {
    expect(resolveFieldValue(rows[0], 'name')).toBe('Ada Lovelace')
    expect(resolveFieldValue(rows[0], 'country.name')).toBe('UK')
    expect(resolveFieldValue(rows[0], 'missing')).toBeUndefined()
  })

  it('rejects dangerous path segments', () => {
    expect(resolveFieldValue(rows[0], '__proto__')).toBeUndefined()
    expect(resolveFieldValue(rows[0], 'prototype')).toBeUndefined()
    expect(resolveFieldValue(rows[0], 'constructor')).toBeUndefined()
    expect(resolveFieldValue(rows[0], 'country.__proto__')).toBeUndefined()
    expect(resolveFieldValue(rows[0], '__proto__.polluted')).toBeUndefined()
    expect(resolveFieldValue(rows[0], 'a.constructor.b')).toBeUndefined()
  })
})

describe('matchConstraint', () => {
  it('treats inactive values as pass', () => {
    expect(matchConstraint('Ada', { value: null, matchMode: FilterMatchMode.CONTAINS })).toBe(true)
    expect(matchConstraint('Ada', { value: '', matchMode: FilterMatchMode.CONTAINS })).toBe(true)
    expect(isConstraintActive({ value: null, matchMode: FilterMatchMode.CONTAINS })).toBe(false)
  })

  it('supports string match modes', () => {
    expect(matchConstraint('Ada Lovelace', { value: 'ada', matchMode: FilterMatchMode.CONTAINS })).toBe(
      true,
    )
    expect(
      matchConstraint('Ada Lovelace', { value: 'grace', matchMode: FilterMatchMode.CONTAINS }),
    ).toBe(false)
    expect(
      matchConstraint('Ada Lovelace', { value: 'ada', matchMode: FilterMatchMode.STARTS_WITH }),
    ).toBe(true)
    expect(
      matchConstraint('Ada Lovelace', { value: 'lace', matchMode: FilterMatchMode.ENDS_WITH }),
    ).toBe(true)
    expect(matchConstraint('Ada', { value: 'ada', matchMode: FilterMatchMode.EQUALS })).toBe(true)
    expect(matchConstraint('Ada', { value: 'ada', matchMode: FilterMatchMode.NOT_EQUALS })).toBe(
      false,
    )
    expect(
      matchConstraint('Ada Lovelace', { value: 'grace', matchMode: FilterMatchMode.NOT_CONTAINS }),
    ).toBe(true)
  })

  it('supports numeric and in/between modes', () => {
    expect(matchConstraint(90, { value: 90, matchMode: FilterMatchMode.EQUALS })).toBe(true)
    expect(matchConstraint(90, { value: 95, matchMode: FilterMatchMode.LESS_THAN })).toBe(true)
    expect(matchConstraint(90, { value: 90, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO })).toBe(
      true,
    )
    expect(matchConstraint(95, { value: 90, matchMode: FilterMatchMode.GREATER_THAN })).toBe(true)
    expect(
      matchConstraint(90, { value: 90, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO }),
    ).toBe(true)
    expect(matchConstraint('A', { value: ['A', 'B'], matchMode: FilterMatchMode.IN })).toBe(true)
    expect(matchConstraint(90, { value: [88, 92], matchMode: FilterMatchMode.BETWEEN })).toBe(true)
    expect(matchConstraint(95, { value: [88, 92], matchMode: FilterMatchMode.BETWEEN })).toBe(false)
  })

  it('supports date modes', () => {
    const a = new Date(2024, 0, 15, 12)
    const b = new Date(2024, 0, 15)
    const c = new Date(2024, 1, 1)
    expect(matchConstraint(a, { value: b, matchMode: FilterMatchMode.DATE_IS })).toBe(true)
    expect(matchConstraint(a, { value: c, matchMode: FilterMatchMode.DATE_IS_NOT })).toBe(true)
    expect(matchConstraint(a, { value: c, matchMode: FilterMatchMode.DATE_BEFORE })).toBe(true)
    expect(matchConstraint(c, { value: a, matchMode: FilterMatchMode.DATE_AFTER })).toBe(true)
  })

  it('fails closed for unknown matchMode when constraint is active', () => {
    expect(
      matchConstraint('Ada', { value: 'ada', matchMode: 'unknownMode' as never }),
    ).toBe(false)
    expect(
      matchConstraint('Ada', { value: 'ada', matchMode: 'toString' as never }),
    ).toBe(false)
  })
})

describe('filterRows', () => {
  it('returns a copy when filters are empty or inactive', () => {
    const copy = filterRows(rows, {})
    expect(copy).toEqual(rows)
    expect(copy).not.toBe(rows)

    expect(
      filterRows(rows, {
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      }),
    ).toEqual(rows)
  })

  it('filters by simple field meta', () => {
    const result = filterRows(rows, {
      name: { value: 'a', matchMode: FilterMatchMode.STARTS_WITH },
    })
    expect(result.map((r) => r.id)).toEqual([1, 3])
  })

  it('ANDs multiple field filters', () => {
    const result = filterRows(rows, {
      name: { value: 'a', matchMode: FilterMatchMode.STARTS_WITH },
      role: { value: 'Scientist', matchMode: FilterMatchMode.EQUALS },
    })
    expect(result.map((r) => r.id)).toEqual([3])
  })

  it('supports advanced AND/OR constraints', () => {
    const andFilters: TableFilters = {
      score: {
        operator: FilterOperator.AND,
        constraints: [
          { value: 89, matchMode: FilterMatchMode.GREATER_THAN },
          { value: 93, matchMode: FilterMatchMode.LESS_THAN },
        ],
      },
    }
    expect(filterRows(rows, andFilters).map((r) => r.id)).toEqual([1, 4])

    const orFilters: TableFilters = {
      role: {
        operator: FilterOperator.OR,
        constraints: [
          { value: 'Admiral', matchMode: FilterMatchMode.EQUALS },
          { value: 'Scientist', matchMode: FilterMatchMode.EQUALS },
        ],
      },
    }
    expect(filterRows(rows, orFilters).map((r) => r.id)).toEqual([2, 3])
  })

  it('applies global filter across globalFilterFields', () => {
    const result = filterRows(
      rows,
      { global: { value: 'uk', matchMode: FilterMatchMode.CONTAINS } },
      { globalFilterFields: ['name', 'country.name'] },
    )
    expect(result.map((r) => r.id)).toEqual([1, 3])
  })

  it('combines global and field filters', () => {
    const result = filterRows(
      rows,
      {
        global: { value: 'u', matchMode: FilterMatchMode.CONTAINS },
        role: { value: 'Engineer', matchMode: FilterMatchMode.EQUALS },
      },
      { globalFilterFields: ['country.name'] },
    )
    // country contains "u" → UK/US all; role Engineer → Ada only
    expect(result.map((r) => r.id)).toEqual([1])
  })

  it('preserves row object identity', () => {
    const result = filterRows(rows, {
      role: { value: 'Admiral', matchMode: FilterMatchMode.EQUALS },
    })
    expect(result[0]).toBe(rows[1])
  })

  it('detects advanced meta helpers', () => {
    const advanced = createEmptyAdvancedFilterMeta()
    expect(isFilterMetaAdvanced(advanced)).toBe(true)
    expect(isFilterMetaAdvanced({ value: null, matchMode: FilterMatchMode.CONTAINS })).toBe(false)
  })
})

describe('DEFAULT_*_MATCH_MODE_OPTIONS', () => {
  it('lists text match modes', () => {
    expect(DEFAULT_TEXT_MATCH_MODE_OPTIONS.map((o) => o.value)).toEqual([
      FilterMatchMode.STARTS_WITH,
      FilterMatchMode.CONTAINS,
      FilterMatchMode.NOT_CONTAINS,
      FilterMatchMode.ENDS_WITH,
      FilterMatchMode.EQUALS,
      FilterMatchMode.NOT_EQUALS,
    ])
  })

  it('lists numeric match modes (PrimeVue dataType="numeric" parity)', () => {
    expect(DEFAULT_NUMERIC_MATCH_MODE_OPTIONS.map((o) => o.value)).toEqual([
      FilterMatchMode.EQUALS,
      FilterMatchMode.NOT_EQUALS,
      FilterMatchMode.LESS_THAN,
      FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
      FilterMatchMode.GREATER_THAN,
      FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
      FilterMatchMode.BETWEEN,
    ])
    expect(DEFAULT_NUMERIC_MATCH_MODE_OPTIONS.map((o) => o.label)).toEqual([
      'Equals',
      'Not equals',
      'Less than',
      'Less than or equal to',
      'Greater than',
      'Greater than or equal to',
      'Between',
    ])
  })
})
