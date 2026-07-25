import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import Pagination from './Pagination.vue'

function pageButtons(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAll('button')
    .filter((btn) => /^Page \d+$/.test(btn.attributes('aria-label') ?? ''))
}

function buttonByLabel(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.find(`button[aria-label="${label}"]`)
}

describe('Pagination', () => {
  it('renders a nav with the default accessible label', () => {
    const wrapper = mount(Pagination, {
      props: { pageCount: 5, page: 1 },
    })

    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('Pagination')
  })

  it('uses a custom label when provided', () => {
    const wrapper = mount(Pagination, {
      props: { pageCount: 3, page: 1, label: 'Results pages' },
    })

    expect(wrapper.find('nav').attributes('aria-label')).toBe('Results pages')
  })

  it('marks the current page with aria-current="page"', () => {
    const wrapper = mount(Pagination, {
      props: { pageCount: 5, page: 3 },
    })

    const current = buttonByLabel(wrapper, 'Page 3')
    expect(current.attributes('aria-current')).toBe('page')

    expect(buttonByLabel(wrapper, 'Page 1').attributes('aria-current')).toBeUndefined()
    expect(buttonByLabel(wrapper, 'Page 2').attributes('aria-current')).toBeUndefined()
  })

  it('disables previous on the first page and next on the last page', () => {
    const first = mount(Pagination, {
      props: { pageCount: 4, page: 1 },
    })
    expect(buttonByLabel(first, 'Previous page').attributes('disabled')).toBeDefined()
    expect(buttonByLabel(first, 'Next page').attributes('disabled')).toBeUndefined()

    const last = mount(Pagination, {
      props: { pageCount: 4, page: 4 },
    })
    expect(buttonByLabel(last, 'Previous page').attributes('disabled')).toBeUndefined()
    expect(buttonByLabel(last, 'Next page').attributes('disabled')).toBeDefined()
  })

  it('disables all controls when disabled is true', () => {
    const wrapper = mount(Pagination, {
      props: { pageCount: 5, page: 3, disabled: true },
    })

    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeDefined()
    }
  })

  it('updates v-model:page when a page or next/prev is clicked', async () => {
    const Host = defineComponent({
      components: { Pagination },
      setup() {
        const page = ref(2)
        return { page }
      },
      template: '<Pagination v-model:page="page" :page-count="5" />',
    })

    const wrapper = mount(Host)

    await buttonByLabel(wrapper, 'Page 4').trigger('click')
    expect(wrapper.vm.page).toBe(4)

    await buttonByLabel(wrapper, 'Next page').trigger('click')
    expect(wrapper.vm.page).toBe(5)

    await buttonByLabel(wrapper, 'Previous page').trigger('click')
    expect(wrapper.vm.page).toBe(4)
  })

  it('does not emit updates for out-of-range or no-op page changes', async () => {
    const wrapper = mount(Pagination, {
      props: { pageCount: 3, page: 1 },
    })

    await buttonByLabel(wrapper, 'Previous page').trigger('click')
    expect(wrapper.emitted('update:page')).toBeUndefined()

    await buttonByLabel(wrapper, 'Page 1').trigger('click')
    expect(wrapper.emitted('update:page')).toBeUndefined()

    await buttonByLabel(wrapper, 'Page 2').trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[2]])
  })

  it('does not update the model when disabled', async () => {
    const wrapper = mount(Pagination, {
      props: { pageCount: 5, page: 2, disabled: true },
    })

    await buttonByLabel(wrapper, 'Page 3').trigger('click')
    await buttonByLabel(wrapper, 'Next page').trigger('click')

    expect(wrapper.emitted('update:page')).toBeUndefined()
  })

  it('shows all pages without ellipsis when the range is short', () => {
    const wrapper = mount(Pagination, {
      props: { pageCount: 5, page: 3, siblingCount: 1 },
    })

    expect(wrapper.text()).not.toContain('…')
    expect(pageButtons(wrapper).map((b) => b.text())).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ])
  })

  it('inserts ellipsis for long ranges around the current page', () => {
    const middle = mount(Pagination, {
      props: { pageCount: 10, page: 5, siblingCount: 1 },
    })

    expect(middle.text()).toContain('…')
    expect(pageButtons(middle).map((b) => b.text())).toEqual([
      '1',
      '4',
      '5',
      '6',
      '10',
    ])

    const nearStart = mount(Pagination, {
      props: { pageCount: 10, page: 2, siblingCount: 1 },
    })
    expect(pageButtons(nearStart).map((b) => b.text())).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '10',
    ])
    expect(nearStart.text()).toContain('…')

    const nearEnd = mount(Pagination, {
      props: { pageCount: 10, page: 9, siblingCount: 1 },
    })
    expect(pageButtons(nearEnd).map((b) => b.text())).toEqual([
      '1',
      '6',
      '7',
      '8',
      '9',
      '10',
    ])
    expect(nearEnd.text()).toContain('…')
  })

  it('respects siblingCount when computing the visible window', () => {
    const wrapper = mount(Pagination, {
      props: { pageCount: 12, page: 6, siblingCount: 2 },
    })

    expect(pageButtons(wrapper).map((b) => b.text())).toEqual([
      '1',
      '4',
      '5',
      '6',
      '7',
      '8',
      '12',
    ])
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Pagination).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Pagination).toBe(components.Pagination)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Pagination.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
    expect(source).not.toMatch(/kablui-accent-\d+/)
    expect(source).not.toMatch(/kablui-danger-\d+/)
  })
})
