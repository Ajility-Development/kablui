import { defineComponent, type PropType } from 'vue'

/**
 * Stable host for invoking a stored slot/render function.
 * Avoids `:is="() => slot()"` which creates a new component type every
 * parent render and can remount/update-storm large tables.
 */
export const SlotFn = defineComponent({
  name: 'KabluiSlotFn',
  inheritAttrs: false,
  props: {
    fn: {
      type: Function as PropType<(slotProps: any) => unknown>,
      required: true,
    },
    props: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
  },
  setup(props) {
    return () => props.fn(props.props)
  },
})
