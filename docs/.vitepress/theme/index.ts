import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { ToastProvider } from 'kablui'
import Demo from '../components/Demo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(ToastProvider, null, {
      default: () => h(DefaultTheme.Layout),
    }),
  enhanceApp({ app }) {
    app.component('Demo', Demo)
  },
} satisfies Theme
