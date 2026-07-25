import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  it('renders default slot inside a native button', () => {
    const wrapper = mount(Button, { slots: { default: 'Save' } })
    const button = wrapper.find('button')

    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Save')
  })

  it('applies default variant and size classes', () => {
    const wrapper = mount(Button, { slots: { default: 'Default' } })
    const classes = wrapper.find('button').classes()

    expect(classes).toContain('bg-kablui-accent')
    expect(classes).toContain('text-kablui-md')
  })

  it('maps each variant exclusively', () => {
    const solid = mount(Button, { props: { variant: 'solid' }, slots: { default: 'S' } })
    const outline = mount(Button, {
      props: { variant: 'outline' },
      slots: { default: 'O' },
    })
    const ghost = mount(Button, { props: { variant: 'ghost' }, slots: { default: 'G' } })

    expect(solid.find('button').classes()).toContain('bg-kablui-accent')
    expect(solid.find('button').classes()).not.toContain('border-kablui-border-strong')
    expect(solid.find('button').classes()).not.toContain('hover:bg-kablui-muted')

    expect(outline.find('button').classes()).toContain('border-kablui-border-strong')
    expect(outline.find('button').classes()).toContain('hover:bg-kablui-muted')
    expect(outline.find('button').classes()).not.toContain('bg-kablui-accent')

    expect(ghost.find('button').classes()).toContain('hover:bg-kablui-muted')
    expect(ghost.find('button').classes()).not.toContain('bg-kablui-accent')
    expect(ghost.find('button').classes()).not.toContain('border-kablui-border-strong')
  })

  it('maps each size exclusively', () => {
    const sm = mount(Button, { props: { size: 'sm' }, slots: { default: 'S' } })
    const md = mount(Button, { props: { size: 'md' }, slots: { default: 'M' } })
    const lg = mount(Button, { props: { size: 'lg' }, slots: { default: 'L' } })

    expect(sm.find('button').classes()).toContain('text-kablui-sm')
    expect(sm.find('button').classes()).not.toContain('text-kablui-md')
    expect(sm.find('button').classes()).not.toContain('text-kablui-lg')

    expect(md.find('button').classes()).toContain('text-kablui-md')
    expect(md.find('button').classes()).not.toContain('text-kablui-sm')
    expect(md.find('button').classes()).not.toContain('text-kablui-lg')

    expect(lg.find('button').classes()).toContain('text-kablui-lg')
    expect(lg.find('button').classes()).not.toContain('text-kablui-sm')
    expect(lg.find('button').classes()).not.toContain('text-kablui-md')
  })

  it('emits click with MouseEvent payload when enabled', async () => {
    const wrapper = mount(Button, { slots: { default: 'Go' } })

    await wrapper.find('button').trigger('click')

    const emitted = wrapper.emitted('click')
    expect(emitted).toHaveLength(1)
    expect(emitted![0][0]).toBeInstanceOf(MouseEvent)
  })

  it('sets native disabled and does not emit click when disabled', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Nope' },
      attrs: { onClick },
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()

    await button.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('passes type="submit" through to the button element', () => {
    const wrapper = mount(Button, {
      props: { type: 'submit' },
      slots: { default: 'Submit' },
    })

    expect(wrapper.find('button').attributes('type')).toBe('submit')
  })

  it('defaults type to button', () => {
    const wrapper = mount(Button, { slots: { default: 'Action' } })
    expect(wrapper.find('button').attributes('type')).toBe('button')
  })

  it('includes focus-visible ring contract with semantic focus token', () => {
    const wrapper = mount(Button, { slots: { default: 'Focus' } })
    const className = wrapper.find('button').attributes('class') ?? ''

    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
    expect(className).toMatch(/focus-visible:ring-offset-kablui-bg/)
    expect(className).toMatch(/focus-visible:ring-/)
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Button).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Button).toBeDefined()
    expect(pkg.Button).toBe(components.Button)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Button.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
    expect(source).not.toMatch(/kablui-accent-\d+/)
    expect(source).not.toMatch(/kablui-danger-\d+/)
  })
})
