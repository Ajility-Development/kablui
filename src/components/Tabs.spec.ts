import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import Tabs from './Tabs.vue'
import TabList from './TabList.vue'
import Tab from './Tab.vue'
import TabPanel from './TabPanel.vue'

function mountTabs(options?: {
  modelValue?: string
  orientation?: 'horizontal' | 'vertical'
  disabledValues?: string[]
}) {
  const value = ref(options?.modelValue)
  const disabled = new Set(options?.disabledValues ?? [])

  const Host = defineComponent({
    setup() {
      return () =>
        h(
          Tabs,
          {
            modelValue: value.value,
            'onUpdate:modelValue': (v: string | undefined) => {
              if (v !== undefined) value.value = v
            },
            orientation: options?.orientation,
          },
          () => [
            h(TabList, null, () => [
              h(Tab, { value: 'a', disabled: disabled.has('a') }, () => 'Alpha'),
              h(Tab, { value: 'b', disabled: disabled.has('b') }, () => 'Beta'),
              h(Tab, { value: 'c', disabled: disabled.has('c') }, () => 'Gamma'),
            ]),
            h(TabPanel, { value: 'a' }, () => 'Panel A'),
            h(TabPanel, { value: 'b' }, () => 'Panel B'),
            h(TabPanel, { value: 'c' }, () => 'Panel C'),
          ],
        )
    },
  })

  const wrapper = mount(Host, { attachTo: document.body })
  return { wrapper, value }
}

describe('Tabs', () => {
  it('exposes default and value-based data-testid attributes', async () => {
    const { wrapper } = mountTabs({ modelValue: 'a' })
    await nextTick()

    expect(wrapper.find('[data-testid="tabs"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tabs-tab-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tabs-tab-a"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tabs-tab-b"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tabs-tab-c"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tabs-tab-panel-a"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tabs-tab-panel-b"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tabs-tab-panel-c"]').exists()).toBe(true)
  })

  it('derives child data-testid values from a consumer override on Tabs', async () => {
    const value = ref('a')
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Tabs,
            {
              modelValue: value.value,
              'onUpdate:modelValue': (v: string | undefined) => {
                if (v !== undefined) value.value = v
              },
              'data-testid': 'settings',
            },
            () => [
              h(TabList, null, () => [
                h(Tab, { value: 'account' }, () => 'Account'),
                h(Tab, { value: 'billing' }, () => 'Billing'),
              ]),
              h(TabPanel, { value: 'account' }, () => 'Account panel'),
              h(TabPanel, { value: 'billing' }, () => 'Billing panel'),
            ],
          )
      },
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    expect(wrapper.find('[data-testid="settings"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="settings-tab-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="settings-tab-account"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="settings-tab-panel-billing"]').exists()).toBe(
      true,
    )
    wrapper.unmount()
  })

  it('updates model when a tab is clicked', async () => {
    const { wrapper, value } = mountTabs({ modelValue: 'a' })
    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[1]!.trigger('click')
    expect(value.value).toBe('b')
    expect(tabs[1]!.attributes('aria-selected')).toBe('true')
    expect(tabs[0]!.attributes('aria-selected')).toBe('false')
  })

  it('exposes tablist / tab / tabpanel roles and ARIA wiring', async () => {
    const { wrapper } = mountTabs({ modelValue: 'a' })
    await nextTick()

    const list = wrapper.find('[role="tablist"]')
    expect(list.exists()).toBe(true)
    expect(list.attributes('aria-orientation')).toBe('horizontal')

    const tabs = wrapper.findAll('[role="tab"]')
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(tabs).toHaveLength(3)
    expect(panels).toHaveLength(3)

    const selected = tabs[0]!
    const selectedPanel = panels[0]!
    expect(selected.attributes('aria-controls')).toBe(selectedPanel.attributes('id'))
    expect(selectedPanel.attributes('aria-labelledby')).toBe(selected.attributes('id'))
    expect(selected.attributes('id')).toMatch(/^kablui-tabs-.+-tab-a$/)
    expect(selectedPanel.attributes('id')).toMatch(/^kablui-tabs-.+-panel-a$/)
  })

  it('sets aria-orientation for vertical tabs', async () => {
    const { wrapper } = mountTabs({ modelValue: 'a', orientation: 'vertical' })
    await nextTick()
    expect(wrapper.find('[role="tablist"]').attributes('aria-orientation')).toBe('vertical')
  })

  it('keeps inactive panels mounted but hidden', async () => {
    const { wrapper } = mountTabs({ modelValue: 'a' })
    await nextTick()

    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels[0]!.attributes('hidden')).toBeUndefined()
    expect(panels[1]!.attributes('hidden')).toBeDefined()
    expect(panels[2]!.attributes('hidden')).toBeDefined()
    expect(panels[1]!.text()).toBe('Panel B')
    expect(panels[2]!.text()).toBe('Panel C')
  })

  it('uses roving tabindex with selected tab focusable', async () => {
    const { wrapper } = mountTabs({ modelValue: 'b' })
    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0]!.attributes('tabindex')).toBe('-1')
    expect(tabs[1]!.attributes('tabindex')).toBe('0')
    expect(tabs[2]!.attributes('tabindex')).toBe('-1')
  })

  it('activates next tab on ArrowRight (automatic activation)', async () => {
    const { wrapper, value } = mountTabs({ modelValue: 'a' })
    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe('b')
    expect(tabs[1]!.attributes('aria-selected')).toBe('true')
    expect(tabs[1]!.attributes('tabindex')).toBe('0')
  })

  it('activates previous tab on ArrowLeft', async () => {
    const { wrapper, value } = mountTabs({ modelValue: 'b' })
    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[1]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(value.value).toBe('a')
  })

  it('wraps arrow navigation at the ends', async () => {
    const { wrapper, value } = mountTabs({ modelValue: 'c' })
    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[2]!.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe('a')
  })

  it('skips disabled tabs when arrowing', async () => {
    const { wrapper, value } = mountTabs({
      modelValue: 'a',
      disabledValues: ['b'],
    })
    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe('c')
  })

  it('supports Home and End', async () => {
    const { wrapper, value } = mountTabs({ modelValue: 'b' })
    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[1]!.trigger('keydown', { key: 'End' })
    expect(value.value).toBe('c')

    await tabs[2]!.trigger('keydown', { key: 'Home' })
    expect(value.value).toBe('a')
  })

  it('uses ArrowUp/ArrowDown when orientation is vertical', async () => {
    const { wrapper, value } = mountTabs({
      modelValue: 'a',
      orientation: 'vertical',
    })
    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(value.value).toBe('b')

    await tabs[1]!.trigger('keydown', { key: 'ArrowUp' })
    expect(value.value).toBe('a')

    // Horizontal arrows should not move selection in vertical mode
    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe('a')
  })

  it('applies selected accent border styling', async () => {
    const { wrapper } = mountTabs({ modelValue: 'a' })
    await nextTick()

    const selected = wrapper.findAll('[role="tab"]')[0]!
    const className = selected.attributes('class') ?? ''
    expect(className).toMatch(/border-kablui-accent/)
    expect(className).toMatch(/text-kablui-accent/)
  })

  it('applies AccordionContent-aligned panel typography and padding', async () => {
    const { wrapper } = mountTabs({ modelValue: 'a' })
    await nextTick()

    const panel = wrapper.find('[role="tabpanel"]')
    const className = panel.attributes('class') ?? ''
    expect(className).toMatch(/\bpx-1\b/)
    expect(className).toMatch(/\bpy-3\b/)
    expect(className).toMatch(/text-kablui-md/)
    expect(className).toMatch(/text-kablui-fg/)
  })

  it('includes focus-visible ring contract like Button', async () => {
    const { wrapper } = mountTabs({ modelValue: 'a' })
    await nextTick()

    const className = wrapper.find('[role="tab"]').attributes('class') ?? ''
    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
    expect(className).toMatch(/focus-visible:ring-offset-kablui-bg/)
  })

  it('warns when Tab / TabList / TabPanel are used outside Tabs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const orphanTab = mount(Tab, { props: { value: 'x' }, slots: { default: () => 'X' } })
    const orphanList = mount(TabList, { slots: { default: () => 'list' } })
    const orphanPanel = mount(TabPanel, {
      props: { value: 'x' },
      slots: { default: () => 'panel' },
    })

    expect(warn).toHaveBeenCalled()
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Tab must be used inside Tabs'))).toBe(
      true,
    )
    expect(
      warn.mock.calls.some((c) => String(c[0]).includes('TabList must be used inside Tabs')),
    ).toBe(true)
    expect(
      warn.mock.calls.some((c) => String(c[0]).includes('TabPanel must be used inside Tabs')),
    ).toBe(true)

    orphanTab.unmount()
    orphanList.unmount()
    orphanPanel.unmount()
    warn.mockRestore()
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Tabs).toBeDefined()
    expect(components.TabList).toBeDefined()
    expect(components.Tab).toBeDefined()
    expect(components.TabPanel).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Tabs).toBe(components.Tabs)
    expect(pkg.TabList).toBe(components.TabList)
    expect(pkg.Tab).toBe(components.Tab)
    expect(pkg.TabPanel).toBe(components.TabPanel)
  })

  it('uses semantic kablui token classes and no hex colors in SFCs', () => {
    for (const file of ['Tabs.vue', 'TabList.vue', 'Tab.vue', 'TabPanel.vue']) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(source).not.toMatch(/kablui-neutral-\d+/)
      expect(source).not.toMatch(/kablui-accent-\d+/)
      expect(source).not.toMatch(/kablui-danger-\d+/)
    }
    for (const file of ['TabList.vue', 'Tab.vue', 'TabPanel.vue']) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')
      expect(source).toMatch(/kablui-/)
    }
    const panelSource = readFileSync(resolve(__dirname, 'TabPanel.vue'), 'utf8')
    expect(panelSource).toMatch(/px-1 py-3 text-kablui-md text-kablui-fg/)
  })
})

describe('a11y', () => {
  it('has no axe violations for default tabs', async () => {
    const value = ref('a')
    const Host = defineComponent({
      setup() {
        return () =>
          h('main', null, [
            h(
              Tabs,
              {
                modelValue: value.value,
                'onUpdate:modelValue': (v: string | undefined) => {
                  if (v !== undefined) value.value = v
                },
              },
              () => [
                h(TabList, null, () => [
                  h(Tab, { value: 'a' }, () => 'Alpha'),
                  h(Tab, { value: 'b' }, () => 'Beta'),
                ]),
                h(TabPanel, { value: 'a' }, () => 'Panel A'),
                h(TabPanel, { value: 'b' }, () => 'Panel B'),
              ],
            ),
          ])
      },
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()
    await expectNoA11yViolations(wrapper.element)
    wrapper.unmount()
  })
})
