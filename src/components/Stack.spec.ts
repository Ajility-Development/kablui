import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Stack from './Stack.vue'

describe('Stack', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Stack, { slots: { default: 'Stacked' } })

    expect(wrapper.text()).toBe('Stacked')
  })

  it('defaults to a div with column flex layout', () => {
    const wrapper = mount(Stack, { slots: { default: 'Body' } })
    const classes = wrapper.classes()

    expect(wrapper.element.tagName).toBe('DIV')
    expect(classes).toContain('flex')
    expect(classes).toContain('flex-col')
    expect(classes).toContain('gap-4')
    expect(classes).toContain('items-stretch')
  })

  it('renders the element from as', () => {
    const wrapper = mount(Stack, {
      props: { as: 'section' },
      slots: { default: 'Section' },
    })

    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('maps each gap exclusively', () => {
    const sm = mount(Stack, { props: { gap: 'sm' }, slots: { default: 'S' } })
    const md = mount(Stack, { props: { gap: 'md' }, slots: { default: 'M' } })
    const lg = mount(Stack, { props: { gap: 'lg' }, slots: { default: 'L' } })

    expect(sm.classes()).toContain('gap-2')
    expect(sm.classes()).not.toContain('gap-4')
    expect(sm.classes()).not.toContain('gap-6')

    expect(md.classes()).toContain('gap-4')
    expect(md.classes()).not.toContain('gap-2')
    expect(md.classes()).not.toContain('gap-6')

    expect(lg.classes()).toContain('gap-6')
    expect(lg.classes()).not.toContain('gap-2')
    expect(lg.classes()).not.toContain('gap-4')
  })

  it('maps each align exclusively', () => {
    const start = mount(Stack, {
      props: { align: 'start' },
      slots: { default: 'S' },
    })
    const center = mount(Stack, {
      props: { align: 'center' },
      slots: { default: 'C' },
    })
    const end = mount(Stack, { props: { align: 'end' }, slots: { default: 'E' } })

    expect(start.classes()).toContain('items-start')
    expect(start.classes()).not.toContain('items-center')
    expect(start.classes()).not.toContain('items-end')

    expect(center.classes()).toContain('items-center')
    expect(center.classes()).not.toContain('items-start')
    expect(center.classes()).not.toContain('items-end')

    expect(end.classes()).toContain('items-end')
    expect(end.classes()).not.toContain('items-start')
    expect(end.classes()).not.toContain('items-center')
  })
})
