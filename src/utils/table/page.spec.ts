import { describe, expect, it } from 'vitest'
import { pageCount, pageRows } from './page'

describe('pageRows', () => {
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  it('returns the first page window', () => {
    expect(pageRows(rows, 1, 3)).toEqual([1, 2, 3])
  })

  it('returns a middle page window', () => {
    expect(pageRows(rows, 2, 3)).toEqual([4, 5, 6])
  })

  it('returns a short final page', () => {
    expect(pageRows(rows, 4, 3)).toEqual([10])
  })

  it('returns empty when page is past the end', () => {
    expect(pageRows(rows, 5, 3)).toEqual([])
  })

  it('treats page below 1 as page 1', () => {
    expect(pageRows(rows, 0, 3)).toEqual([1, 2, 3])
    expect(pageRows(rows, -2, 3)).toEqual([1, 2, 3])
  })

  it('returns all rows when rowsPerPage is invalid', () => {
    expect(pageRows(rows, 1, 0)).toEqual(rows)
    expect(pageRows(rows, 1, -1)).toEqual(rows)
  })

  it('floors fractional page and size', () => {
    expect(pageRows(rows, 2.9, 3.8)).toEqual([4, 5, 6])
  })
})

describe('pageCount', () => {
  it('ceil-divides total by page size', () => {
    expect(pageCount(10, 3)).toBe(4)
    expect(pageCount(9, 3)).toBe(3)
    expect(pageCount(1, 10)).toBe(1)
  })

  it('returns 0 for empty or invalid inputs', () => {
    expect(pageCount(0, 10)).toBe(0)
    expect(pageCount(10, 0)).toBe(0)
    expect(pageCount(-5, 10)).toBe(0)
    expect(pageCount(10, -1)).toBe(0)
  })

  it('floors fractional inputs', () => {
    expect(pageCount(10.9, 3.2)).toBe(4)
  })
})
