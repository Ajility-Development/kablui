import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Cluster from './Cluster.vue'

describe('Cluster', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Cluster, { slots: { default: 'Clustered' } })

    expect(wrapper.text()).toBe('Clustered')
  })

  it('defaults to a wrapping flex row', () => {
    const wrapper = mount(Cluster, { slots: { default: 'Body' } })
    const classes = wrapper.classes()

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('data-testid')).toBe('cluster')
    expect(classes).toContain('flex')
    expect(classes).toContain('flex-wrap')
    expect(classes).toContain('gap-4')
    expect(classes).toContain('items-center')
    expect(classes).toContain('justify-start')
  })

  it('renders the element from as', () => {
    const wrapper = mount(Cluster, {
      props: { as: 'ul' },
      slots: { default: 'List' },
    })

    expect(wrapper.element.tagName).toBe('UL')
  })

  it('maps each gap exclusively', () => {
    const sm = mount(Cluster, { props: { gap: 'sm' }, slots: { default: 'S' } })
    const md = mount(Cluster, { props: { gap: 'md' }, slots: { default: 'M' } })
    const lg = mount(Cluster, { props: { gap: 'lg' }, slots: { default: 'L' } })

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

  it('maps align and justify classes', () => {
    const wrapper = mount(Cluster, {
      props: { align: 'end', justify: 'between' },
      slots: { default: 'Aligned' },
    })
    const classes = wrapper.classes()

    expect(classes).toContain('items-end')
    expect(classes).toContain('justify-between')
    expect(classes).not.toContain('items-center')
    expect(classes).not.toContain('justify-start')
  })
})
