import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { __resetScrollLock, useScrollLock } from './useScrollLock'

beforeEach(() => {
  __resetScrollLock()
  document.body.style.overflow = ''
})

afterEach(() => {
  __resetScrollLock()
  document.body.style.overflow = ''
})

describe('useScrollLock', () => {
  it('locks body overflow while active and restores on deactivate', async () => {
    document.body.style.overflow = 'scroll'
    const active = ref(false)
    const scope = effectScope()
    scope.run(() => {
      useScrollLock(active)
    })

    expect(document.body.style.overflow).toBe('scroll')

    active.value = true
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    active.value = false
    await nextTick()
    expect(document.body.style.overflow).toBe('scroll')

    scope.stop()
  })

  it('ref-counts nested locks so unlock only happens at zero', async () => {
    const outer = ref(false)
    const inner = ref(false)
    const scope = effectScope()
    scope.run(() => {
      useScrollLock(outer)
      useScrollLock(inner)
    })

    outer.value = true
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    inner.value = true
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    outer.value = false
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    inner.value = false
    await nextTick()
    expect(document.body.style.overflow).toBe('')

    scope.stop()
  })

  it('releases its hold on scope dispose', async () => {
    const active = ref(true)
    const scope = effectScope()
    scope.run(() => {
      useScrollLock(active)
    })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    scope.stop()
    expect(document.body.style.overflow).toBe('')
  })

  it('keeps lock when one of two holders disposes', async () => {
    const a = ref(true)
    const b = ref(true)
    const scopeA = effectScope()
    const scopeB = effectScope()
    scopeA.run(() => useScrollLock(a))
    scopeB.run(() => useScrollLock(b))
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    scopeA.stop()
    expect(document.body.style.overflow).toBe('hidden')

    scopeB.stop()
    expect(document.body.style.overflow).toBe('')
  })
})
