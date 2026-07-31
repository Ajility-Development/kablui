import { describe, expect, it } from 'vitest'
import {
  computeFrozenOffsets,
  declaredColumnWidthPx,
  parseCssPx,
} from './frozen'

describe('parseCssPx', () => {
  it('parses px lengths', () => {
    expect(parseCssPx('200px')).toBe(200)
    expect(parseCssPx('12.5px')).toBe(12.5)
  })

  it('returns 0 for missing or non-px', () => {
    expect(parseCssPx(undefined)).toBe(0)
    expect(parseCssPx('10rem')).toBe(0)
    expect(parseCssPx('auto')).toBe(0)
  })
})

describe('declaredColumnWidthPx', () => {
  it('prefers width over minWidth', () => {
    expect(declaredColumnWidthPx({ width: '120px', minWidth: '200px' })).toBe(120)
  })

  it('falls back to minWidth', () => {
    expect(declaredColumnWidthPx({ minWidth: '180px' })).toBe(180)
  })
})

describe('computeFrozenOffsets', () => {
  const cols = [
    { id: 'a', frozen: true, alignFrozen: 'left' as const, minWidth: '100px' },
    { id: 'b', frozen: true, alignFrozen: 'left' as const, minWidth: '80px' },
    { id: 'c', frozen: false, minWidth: '200px' },
    { id: 'd', frozen: true, alignFrozen: 'right' as const, minWidth: '90px' },
    { id: 'e', frozen: true, alignFrozen: 'right' as const, minWidth: '70px' },
  ]

  it('accumulates left and right offsets from declared widths', () => {
    expect(computeFrozenOffsets(cols)).toEqual({
      a: { side: 'left', offset: 0 },
      b: { side: 'left', offset: 100 },
      e: { side: 'right', offset: 0 },
      d: { side: 'right', offset: 70 },
    })
  })

  it('defaults alignFrozen to left when frozen', () => {
    expect(
      computeFrozenOffsets([{ id: 'x', frozen: true, minWidth: '50px' }]),
    ).toEqual({
      x: { side: 'left', offset: 0 },
    })
  })

  it('prefers measured widths when provided', () => {
    expect(
      computeFrozenOffsets(cols, { a: 110, b: 95, d: 88, e: 66 }),
    ).toEqual({
      a: { side: 'left', offset: 0 },
      b: { side: 'left', offset: 110 },
      e: { side: 'right', offset: 0 },
      d: { side: 'right', offset: 66 },
    })
  })

  it('returns empty map when nothing is frozen', () => {
    expect(
      computeFrozenOffsets([{ id: 'c', frozen: false, minWidth: '200px' }]),
    ).toEqual({})
  })
})
