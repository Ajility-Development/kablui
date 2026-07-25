import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Skeleton from './Skeleton.vue'

describe('Skeleton', () => {
  it('is aria-hidden', () => {
    const wrapper = mount(Skeleton)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('applies muted token and pulse animation by default', () => {
    const wrapper = mount(Skeleton)
    const classes = wrapper.classes()

    expect(classes).toContain('bg-kablui-muted')
    expect(classes).toContain('animate-pulse')
    expect(classes).toContain('rounded-kablui-md')
  })

  it('can disable animation', () => {
    const wrapper = mount(Skeleton, { props: { animated: false } })

    expect(wrapper.classes()).not.toContain('animate-pulse')
  })

  it('renders circle shape with full radius', () => {
    const wrapper = mount(Skeleton, { props: { circle: true } })

    expect(wrapper.classes()).toContain('rounded-kablui-full')
    expect(wrapper.classes()).not.toContain('rounded-kablui-md')
  })

  it('applies width and height style overrides', () => {
    const wrapper = mount(Skeleton, {
      props: { width: '12rem', height: '2rem' },
    })
    const style = wrapper.attributes('style') ?? ''

    expect(style).toMatch(/width:\s*12rem/)
    expect(style).toMatch(/height:\s*2rem/)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Skeleton.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
  })
})
