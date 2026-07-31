import { describe, expect, it } from 'vitest'
import { applyColumnResize, sumColumnWidths } from './resize'

describe('applyColumnResize', () => {
  const ids = ['a', 'b', 'c']
  const widths = { a: 100, b: 100, c: 100 }

  it('fit mode steals from the next column', () => {
    const result = applyColumnResize({
      columnIds: ids,
      widths,
      resizedColumnId: 'a',
      delta: 20,
      mode: 'fit',
    })
    expect(result.widths).toEqual({ a: 120, b: 80, c: 100 })
    expect(result.tableWidthDelta).toBe(0)
  })

  it('fit mode returns width when shrinking (gives to neighbor)', () => {
    const result = applyColumnResize({
      columnIds: ids,
      widths,
      resizedColumnId: 'a',
      delta: -30,
      mode: 'fit',
    })
    expect(result.widths).toEqual({ a: 70, b: 130, c: 100 })
    expect(result.tableWidthDelta).toBe(0)
  })

  it('fit mode respects minWidth on both columns', () => {
    const result = applyColumnResize({
      columnIds: ids,
      widths: { a: 60, b: 60, c: 100 },
      resizedColumnId: 'a',
      delta: 50,
      mode: 'fit',
      minWidth: 50,
    })
    // neighbor can only give 10px
    expect(result.widths).toEqual({ a: 70, b: 50, c: 100 })
  })

  it('fit mode uses previous neighbor on the last column', () => {
    const result = applyColumnResize({
      columnIds: ids,
      widths,
      resizedColumnId: 'c',
      delta: 25,
      mode: 'fit',
    })
    expect(result.widths).toEqual({ a: 100, b: 75, c: 125 })
  })

  it('expand mode grows only the resized column', () => {
    const result = applyColumnResize({
      columnIds: ids,
      widths,
      resizedColumnId: 'b',
      delta: 40,
      mode: 'expand',
    })
    expect(result.widths).toEqual({ a: 100, b: 140, c: 100 })
    expect(result.tableWidthDelta).toBe(40)
  })

  it('expand mode shrinks with minWidth floor', () => {
    const result = applyColumnResize({
      columnIds: ids,
      widths,
      resizedColumnId: 'b',
      delta: -80,
      mode: 'expand',
      minWidth: 50,
    })
    expect(result.widths.b).toBe(50)
    expect(result.tableWidthDelta).toBe(-50)
  })

  it('no-ops for unknown column id', () => {
    const result = applyColumnResize({
      columnIds: ids,
      widths,
      resizedColumnId: 'missing',
      delta: 10,
      mode: 'fit',
    })
    expect(result.widths).toEqual(widths)
    expect(result.tableWidthDelta).toBe(0)
  })
})

describe('sumColumnWidths', () => {
  it('sums known widths and ignores missing', () => {
    expect(sumColumnWidths(['a', 'b', 'c'], { a: 10, c: 5 })).toBe(15)
  })
})
