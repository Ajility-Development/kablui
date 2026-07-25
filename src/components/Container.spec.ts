import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Container from './Container.vue'

describe('Container', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Container, { slots: { default: 'Contained' } })

    expect(wrapper.text()).toBe('Contained')
  })

  it('defaults to a centered full-width medium container', () => {
    const wrapper = mount(Container, { slots: { default: 'Body' } })
    const classes = wrapper.classes()

    expect(wrapper.element.tagName).toBe('DIV')
    expect(classes).toContain('mx-auto')
    expect(classes).toContain('w-full')
    expect(classes).toContain('max-w-screen-md')
    expect(classes).toContain('px-4')
  })

  it('renders the element from as', () => {
    const wrapper = mount(Container, {
      props: { as: 'main' },
      slots: { default: 'Main' },
    })

    expect(wrapper.element.tagName).toBe('MAIN')
  })

  it('maps each size exclusively', () => {
    const sm = mount(Container, {
      props: { size: 'sm' },
      slots: { default: 'S' },
    })
    const md = mount(Container, {
      props: { size: 'md' },
      slots: { default: 'M' },
    })
    const lg = mount(Container, {
      props: { size: 'lg' },
      slots: { default: 'L' },
    })

    expect(sm.classes()).toContain('max-w-screen-sm')
    expect(sm.classes()).toContain('px-4')
    expect(sm.classes()).not.toContain('max-w-screen-md')
    expect(sm.classes()).not.toContain('max-w-screen-lg')

    expect(md.classes()).toContain('max-w-screen-md')
    expect(md.classes()).toContain('px-4')
    expect(md.classes()).not.toContain('max-w-screen-sm')
    expect(md.classes()).not.toContain('max-w-screen-lg')

    expect(lg.classes()).toContain('max-w-screen-lg')
    expect(lg.classes()).toContain('px-6')
    expect(lg.classes()).not.toContain('max-w-screen-sm')
    expect(lg.classes()).not.toContain('max-w-screen-md')
  })
})
