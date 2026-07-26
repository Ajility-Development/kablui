import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { __resetIdCounter, useId } from './useId'

beforeEach(() => {
  __resetIdCounter()
})

describe('useId', () => {
  describe('outside setup (module counter)', () => {
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

  describe('during Vue setup', () => {
    it('uses Vue useId with kablui-${prefix}- prefix', () => {
      let setupId = ''
      const Comp = defineComponent({
        setup() {
          setupId = useId('control')
          return () => h('div')
        },
      })

      mount(Comp)

      expect(setupId).toMatch(/^kablui-control-/)
      // Vue's useId yields `v-*` (or custom idPrefix), not the module counter.
      expect(setupId).not.toBe('kablui-control-1')
      expect(setupId).toMatch(/^kablui-control-v-/)
    })

    it('does not advance the module counter', () => {
      const Comp = defineComponent({
        setup() {
          useId('setup')
          return () => h('div')
        },
      })

      mount(Comp)

      expect(useId('outside')).toBe('kablui-outside-1')
    })
  })
})
