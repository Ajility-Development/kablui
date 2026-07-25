<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue'
import type { ComputedRef, Slots } from 'vue'
import { useDismissable } from '../composables/useDismissable'
import { useFocusTrap } from '../composables/useFocusTrap'
import { useId } from '../composables/useId'
import { useOverlayStack } from '../composables/useOverlayStack'
import { useScrollLock } from '../composables/useScrollLock'

export interface DialogProps {
  /** Dismiss on Escape and backdrop click. Defaults to `true`. */
  dismissible?: boolean
  /** Show a close button in the header. Defaults to `false`. */
  showClose?: boolean
  /** Teleport target. Defaults to `body`. */
  to?: string | HTMLElement
}

const props = withDefaults(defineProps<DialogProps>(), {
  dismissible: true,
  showClose: false,
  to: 'body',
})

const open = defineModel<boolean>('open', { default: false })

const slots: Slots = useSlots()
const panelRef = ref<HTMLElement | null>(null)

const titleId = useId('dialog-title')
const descriptionId = useId('dialog-description')

const hasTitle: ComputedRef<boolean> = computed(() => !!slots.title)
const hasDescription: ComputedRef<boolean> = computed(() => !!slots.description)

const { register, unregister } = useOverlayStack('modal')

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

// Register overlay stack before dismissable so Escape ownership uses `isTop`.
useDismissable(panelRef, {
  active: () => !!open.value && props.dismissible,
  onDismiss,
  escape: true,
  outside: true,
})

const shellClasses = [
  'fixed inset-0 z-kablui-modal',
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

const closeClasses = [
  'ml-auto shrink-0 -mr-1 -mt-0.5 inline-flex size-7 items-center justify-center',
  'rounded-kablui-sm text-kablui-muted-fg hover:bg-kablui-muted hover:text-kablui-fg',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')
</script>

<template>
  <Teleport :to="to">
    <div
      v-if="open"
      :class="shellClasses"
      data-kablui-dialog
    >
      <div
        :class="backdropClasses"
        aria-hidden="true"
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
        data-kablui-dialog-panel
      >
        <div
          v-if="hasTitle || hasDescription || showClose"
          :class="headerClasses"
        >
          <div class="min-w-0 flex-1">
            <h2
              v-if="hasTitle"
              :id="titleId"
              :class="titleClasses"
            >
              <slot name="title" />
            </h2>
            <p
              v-if="hasDescription"
              :id="descriptionId"
              :class="[descriptionClasses, hasTitle ? undefined : 'mt-0']"
            >
              <slot name="description" />
            </p>
          </div>
          <button
            v-if="showClose"
            type="button"
            :class="closeClasses"
            aria-label="Close"
            @click="close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
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
