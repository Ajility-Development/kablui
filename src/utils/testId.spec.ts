import { describe, expect, it } from 'vitest'
import {
  omitDataTestId,
  partTestId,
  resolveTestId,
  sanitizeTestIdValue,
  valueTestId,
} from './testId'

describe('sanitizeTestIdValue', () => {
  it('lowercases the value', () => {
    expect(sanitizeTestIdValue('US')).toBe('us')
    expect(sanitizeTestIdValue('Hello')).toBe('hello')
  })

  it('replaces non-[a-z0-9_-] characters with hyphens', () => {
    expect(sanitizeTestIdValue('Hello World')).toBe('hello-world')
    expect(sanitizeTestIdValue('a/b.c')).toBe('a-b-c')
    expect(sanitizeTestIdValue('foo@bar!')).toBe('foo-bar-')
  })

  it('preserves hyphens and underscores', () => {
    expect(sanitizeTestIdValue('foo-bar_baz')).toBe('foo-bar_baz')
  })

  it('leaves already-safe lowercase values unchanged', () => {
    expect(sanitizeTestIdValue('option-1')).toBe('option-1')
  })
})

describe('resolveTestId', () => {
  it('returns the attrs override when it is a non-empty string', () => {
    expect(resolveTestId({ 'data-testid': 'custom' }, 'fallback')).toBe('custom')
  })

  it('returns the fallback when data-testid is missing', () => {
    expect(resolveTestId({}, 'fallback')).toBe('fallback')
  })

  it('returns the fallback when data-testid is empty', () => {
    expect(resolveTestId({ 'data-testid': '' }, 'fallback')).toBe('fallback')
  })

  it('returns the fallback when data-testid is not a string', () => {
    expect(resolveTestId({ 'data-testid': 42 }, 'fallback')).toBe('fallback')
    expect(resolveTestId({ 'data-testid': true }, 'fallback')).toBe('fallback')
    expect(resolveTestId({ 'data-testid': null }, 'fallback')).toBe('fallback')
  })
})

describe('partTestId', () => {
  it('joins base and part with a hyphen', () => {
    expect(partTestId('select', 'trigger')).toBe('select-trigger')
    expect(partTestId('tabs', 'list')).toBe('tabs-list')
  })
})

describe('valueTestId', () => {
  it('joins base, part, and sanitized value', () => {
    expect(valueTestId('select', 'option', 'US')).toBe('select-option-us')
    expect(valueTestId('tabs', 'tab', 'Account Settings')).toBe(
      'tabs-tab-account-settings',
    )
  })
})

describe('omitDataTestId', () => {
  it('removes data-testid and keeps other attrs', () => {
    expect(
      omitDataTestId({ 'data-testid': 'root', role: 'button', id: 'x' }),
    ).toEqual({ role: 'button', id: 'x' })
  })

  it('returns attrs unchanged when data-testid is absent', () => {
    expect(omitDataTestId({ role: 'button' })).toEqual({ role: 'button' })
  })
})
