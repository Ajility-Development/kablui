import { describe, expect, it } from 'vitest'
import { computeVirtualWindow, shouldEmitVirtualLazyLoad } from './virtual'

describe('computeVirtualWindow', () => {
  it('returns an empty window for invalid size or count', () => {
    expect(
      computeVirtualWindow({
        scrollTop: 0,
        viewportHeight: 200,
        itemCount: 100,
        itemSize: 0,
      }),
    ).toEqual({ startIndex: 0, endIndex: 0, offsetTop: 0, offsetBottom: 0 })

    expect(
      computeVirtualWindow({
        scrollTop: 0,
        viewportHeight: 200,
        itemCount: 0,
        itemSize: 40,
      }),
    ).toEqual({ startIndex: 0, endIndex: 0, offsetTop: 0, offsetBottom: 0 })
  })

  it('windows the start of a long list', () => {
    const win = computeVirtualWindow({
      scrollTop: 0,
      viewportHeight: 200,
      itemCount: 1000,
      itemSize: 40,
      numToleratedItems: 2,
    })
    // visible = ceil(200/40)=5; with overscan 2 → end = 7
    expect(win.startIndex).toBe(0)
    expect(win.endIndex).toBe(7)
    expect(win.offsetTop).toBe(0)
    expect(win.offsetBottom).toBe((1000 - 7) * 40)
  })

  it('windows a mid-list scroll position with overscan', () => {
    const win = computeVirtualWindow({
      scrollTop: 400,
      viewportHeight: 200,
      itemCount: 1000,
      itemSize: 40,
      numToleratedItems: 3,
    })
    // rawStart = 10; start = 7; end = 10+5+3 = 18
    expect(win.startIndex).toBe(7)
    expect(win.endIndex).toBe(18)
    expect(win.offsetTop).toBe(7 * 40)
    expect(win.offsetBottom).toBe((1000 - 18) * 40)
  })

  it('clamps the window at the end of the list', () => {
    const win = computeVirtualWindow({
      scrollTop: 39_600,
      viewportHeight: 200,
      itemCount: 1000,
      itemSize: 40,
      numToleratedItems: 5,
    })
    expect(win.endIndex).toBe(1000)
    expect(win.startIndex).toBeLessThan(1000)
    expect(win.offsetBottom).toBe(0)
  })
})

describe('shouldEmitVirtualLazyLoad', () => {
  it('emits on first range and when the range changes', () => {
    expect(shouldEmitVirtualLazyLoad(null, { first: 0, last: 20 })).toBe(true)
    expect(shouldEmitVirtualLazyLoad({ first: 0, last: 20 }, { first: 0, last: 20 })).toBe(
      false,
    )
    expect(shouldEmitVirtualLazyLoad({ first: 0, last: 20 }, { first: 10, last: 30 })).toBe(
      true,
    )
  })

  it('skips empty ranges', () => {
    expect(shouldEmitVirtualLazyLoad(null, { first: 5, last: 5 })).toBe(false)
  })
})
