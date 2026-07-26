import { defineConfig } from 'vitepress'

/**
 * Component page convention:
 * Overview → Usage → Props/Models/Emits/Slots → Accessibility → Related
 * Examples import from `kablui`, not relative `src/` paths.
 * See docs/guides/writing-docs.md
 */
export default defineConfig({
  title: 'kablui',
  description: 'Tailwind CSS–based UI components for Vue 3',
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: 'Guides', link: '/guides/getting-started' },
      { text: 'Components', link: '/components/' },
      {
        text: 'GitHub',
        link: 'https://github.com/ajility/kablui',
      },
    ],

    sidebar: [
      {
        text: 'Guides',
        items: [
          { text: 'Getting started', link: '/guides/getting-started' },
          { text: 'Theming', link: '/guides/theming' },
          { text: 'Tailwind composition', link: '/guides/tailwind' },
          { text: 'Tree-shaking & imports', link: '/guides/tree-shaking' },
          { text: 'Writing docs', link: '/guides/writing-docs' },
          { text: 'Contributing', link: '/guides/contributing' },
          { text: 'Releasing', link: '/guides/releasing' },
        ],
      },
      {
        text: 'Primitives',
        items: [
          { text: 'Button', link: '/components/button' },
          { text: 'Text', link: '/components/text' },
          { text: 'Icon', link: '/components/icon' },
          { text: 'Link', link: '/components/link' },
          { text: 'Badge', link: '/components/badge' },
          { text: 'Separator', link: '/components/separator' },
        ],
      },
      {
        text: 'Forms',
        items: [
          { text: 'Field', link: '/components/field' },
          { text: 'Input', link: '/components/input' },
          { text: 'Textarea', link: '/components/textarea' },
          { text: 'Checkbox', link: '/components/checkbox' },
          { text: 'RadioGroup', link: '/components/radio-group' },
          { text: 'Switch', link: '/components/switch' },
          { text: 'Select', link: '/components/select' },
        ],
      },
      {
        text: 'Layout',
        items: [
          { text: 'Stack', link: '/components/stack' },
          { text: 'Cluster', link: '/components/cluster' },
          { text: 'Container', link: '/components/container' },
        ],
      },
      {
        text: 'Feedback',
        items: [
          { text: 'Alert', link: '/components/alert' },
          { text: 'Spinner', link: '/components/spinner' },
          { text: 'Progress', link: '/components/progress' },
          { text: 'Skeleton', link: '/components/skeleton' },
          { text: 'Empty', link: '/components/empty' },
        ],
      },
      {
        text: 'Overlays',
        items: [
          { text: 'Dialog', link: '/components/dialog' },
          { text: 'Popover', link: '/components/popover' },
          { text: 'Tooltip', link: '/components/tooltip' },
          { text: 'Menu', link: '/components/menu' },
          { text: 'Toast', link: '/components/toast' },
        ],
      },
      {
        text: 'Patterns',
        items: [
          { text: 'Card', link: '/components/card' },
          { text: 'Accordion', link: '/components/accordion' },
          { text: 'Tabs', link: '/components/tabs' },
          { text: 'Pagination', link: '/components/pagination' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ajility/kablui' },
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/ajility/kablui/edit/main/docs/:path',
      text: 'Edit this page',
    },
  },
})
