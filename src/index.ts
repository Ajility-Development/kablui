import './styles/index.css'
import packageJson from '../package.json' with { type: 'json' }

export const version = packageJson.version

export * from './components'
export { useField, provideField, useFieldControlAttrs } from './composables/useField'
export type { FieldContext, ProvideFieldOptions } from './composables/useField'
export { useToast } from './composables/useToast'
export type {
  ToastAction,
  ToastContext,
  ToastOptions,
  ToastPlacement,
  ToastTone,
} from './components/toastContext'
