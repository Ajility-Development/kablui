import { beforeEach, describe, expect, it } from 'vitest'
import { __resetIdCounter, useId } from './useId'

beforeEach(() => {
  __resetIdCounter()
})

describe('useId', () => {
  it('returns kablui-prefixed ids with the given prefix', () => {
    expect(useId('control')).toBe('kablui-control-1')
    expect(useId('hint')).toBe('kablui-hint-2')
  })

  it('increments a shared counter across prefixes', () => {
    expect(useId('a')).toBe('kablui-a-1')
    expect(useId('b')).toBe('kablui-b-2')
    expect(useId('a')).toBe('kablui-a-3')
  })

  it('resets via __resetIdCounter', () => {
    expect(useId('x')).toBe('kablui-x-1')
    __resetIdCounter()
    expect(useId('x')).toBe('kablui-x-1')
  })
})
