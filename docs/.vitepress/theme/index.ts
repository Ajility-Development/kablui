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

    // Surface the underlying error and never rethrow — a throwing app
    // errorHandler (e.g. extensions) turns one Table render failure into
    // thousands of "Unhandled error during execution of app errorHandler" warns.
    const previous = app.config.errorHandler
    app.config.errorHandler = (err, instance, info) => {
      console.error(`[kablui docs] ${info}`, err)
      if (typeof previous !== 'function') return
      try {
        previous(err, instance, info)
      } catch (handlerErr) {
        console.error('[kablui docs] previous errorHandler threw', handlerErr)
      }
    }
  },
} satisfies Theme
