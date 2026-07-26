<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, watch } from 'vue'
import type { ComputedRef, Slots } from 'vue'
import { useDismissible } from '../composables/useDismissible'
import { useFocusTrap } from '../composables/useFocusTrap'
import { useId } from '../composables/useId'
import { useOverlayStack } from '../composables/useOverlayStack'
import { useScrollLock } from '../composables/useScrollLock'
import { omitDataTestId, partTestId, resolveTestId } from '../utils/testId'
import DismissButton from './DismissButton.vue'

export interface DialogProps {
  /** Dismiss on Escape and backdrop click. Defaults to `true`. */
  dismissible?: boolean
  /** Show a dismiss button in the header. Defaults to `false`. */
  showDismiss?: boolean
  /** Teleport target. Defaults to `body`. */
  to?: string | HTMLElement
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<DialogProps>(), {
  dismissible: true,
  showDismiss: false,
  to: 'body',
})

const open = defineModel<boolean>('open', { default: false })

const attrs = useAttrs()
const testIdBase = computed(() => resolveTestId(attrs, 'dialog'))

const slots: Slots = useSlots()
const panelRef = ref<HTMLElement | null>(null)

const titleId = useId('dialog-title')
const descriptionId = useId('dialog-description')

const hasTitle: ComputedRef<boolean> = computed(() => !!slots.title)
const hasDescription: ComputedRef<boolean> = computed(() => !!slots.description)

const { register, unregister } = useOverlayStack('dialog')

watch(
  open,
  (isOpen) => {
    if (isOpen) register()
    else unregister()
  },
  { immediate: true },
)

function close() {
  open.value = false
}

function onDismiss() {
  if (!props.dismissible) return
  open.value = false
}

useScrollLock(open)
useFocusTrap(panelRef, { active: open })

// Register overlay stack before dismissible so Escape ownership uses `isTop`.
useDismissible(panelRef, {
  active: () => !!open.value && props.dismissible,
  onDismiss,
  escape: true,
  outside: true,
})

const shellClasses = [
  'fixed inset-0 z-kablui-dialog',
  'flex items-center justify-center p-4',
].join(' ')

const backdropClasses = 'absolute inset-0 bg-kablui-overlay'

const panelClasses = [
  'relative flex w-full max-w-md flex-col',
  'rounded-kablui-md border border-kablui-border bg-kablui-bg text-kablui-fg',
  'shadow-kablui-lg',
  'outline-none',
].join(' ')

const headerClasses = 'flex items-start gap-3 px-4 pt-4'

const titleClasses = 'font-kablui-semibold text-kablui-lg text-kablui-fg'

const descriptionClasses = 'mt-1 text-kablui-sm text-kablui-muted-fg'

const bodyClasses = 'px-4 py-3 text-kablui-md'

const footerClasses =
  'flex flex-wrap items-center justify-end gap-2 border-t border-kablui-border px-4 py-3'
</script>

<template>
  <Teleport :to="to">
    <div
      v-if="open"
      v-bind="omitDataTestId(attrs)"
      :class="shellClasses"
      :data-testid="testIdBase"
      data-kablui-dialog
    >
      <div
        :class="backdropClasses"
        aria-hidden="true"
        :data-testid="partTestId(testIdBase, 'backdrop')"
        data-kablui-dialog-backdrop
      />
      <div
        ref="panelRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="hasTitle ? titleId : undefined"
        :aria-describedby="hasDescription ? descriptionId : undefined"
        :class="panelClasses"
        tabindex="-1"
        :data-testid="partTestId(testIdBase, 'panel')"
        data-kablui-dialog-panel
      >
        <div
          v-if="hasTitle || hasDescription || showDismiss"
          :class="headerClasses"
        >
          <div class="min-w-0 flex-1">
            <h2
              v-if="hasTitle"
              :id="titleId"
              :class="titleClasses"
              :data-testid="partTestId(testIdBase, 'title')"
            >
              <slot name="title" />
            </h2>
            <p
              v-if="hasDescription"
              :id="descriptionId"
              :class="[descriptionClasses, hasTitle ? undefined : 'mt-0']"
              :data-testid="partTestId(testIdBase, 'description')"
            >
              <slot name="description" />
            </p>
          </div>
          <DismissButton
            v-if="showDismiss"
            class="ml-auto -mr-1 -mt-0.5"
            :data-testid="partTestId(testIdBase, 'dismiss')"
            @click="close"
          />
        </div>
        <div
          v-if="$slots.default"
          :class="bodyClasses"
        >
          <slot />
        </div>
        <div
          v-if="$slots.footer"
          :class="footerClasses"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
