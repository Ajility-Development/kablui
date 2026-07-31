<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
  type Component,
} from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  /** Path to a demo SFC, relative to the current markdown page. */
  src: string
  /** Optional heading above the preview. */
  title?: string
}>()

const { page } = useData()
const showCode = ref(false)
const chromeEl = ref<HTMLElement | null>(null)
/** Once true, stays true — demo mounts once and is not torn down on scroll away. */
const shouldMount = ref(false)
const DemoComponent = shallowRef<Component | null>(null)
const demoLoadFailed = ref(false)
const sourceCode = ref<string | null>(null)

const modules = import.meta.glob('../../components/demos/**/*.vue', {
  eager: false,
  import: 'default',
}) as Record<string, () => Promise<Component>>

const sources = import.meta.glob('../../components/demos/**/*.vue', {
  eager: false,
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

/** Resolve `src` against the current page into a docs-root-relative path. */
function toDocsPath(src: string, pageRelativePath: string): string {
  const pageDir = pageRelativePath.includes('/')
    ? pageRelativePath.slice(0, pageRelativePath.lastIndexOf('/') + 1)
    : ''
  const url = new URL(src, `file:///${pageDir}`)
  return decodeURIComponent(url.pathname.replace(/^\/+/, ''))
}

/** Map docs-relative path → glob key (`../../components/demos/...`). */
function resolveKey(docsPath: string): string | undefined {
  const direct = `../../${docsPath}`
  if (modules[direct]) return direct
  const file = docsPath.split('/').pop()
  if (!file) return undefined
  return Object.keys(modules).find((key) => key.endsWith(`/${file}`))
}

const key = computed(() =>
  resolveKey(toDocsPath(props.src, page.value.relativePath)),
)

async function loadDemo(): Promise<void> {
  if (!key.value || DemoComponent.value || demoLoadFailed.value) return
  const loader = modules[key.value]
  if (!loader) {
    demoLoadFailed.value = true
    return
  }
  try {
    DemoComponent.value = await loader()
  } catch {
    demoLoadFailed.value = true
  }
}

async function loadSource(): Promise<void> {
  if (!key.value || sourceCode.value !== null) return
  const loader = sources[key.value]
  if (!loader) {
    sourceCode.value = `<!-- Demo not found: ${props.src} -->`
    return
  }
  try {
    sourceCode.value = await loader()
  } catch {
    sourceCode.value = `<!-- Demo not found: ${props.src} -->`
  }
}

function toggleCode(): void {
  showCode.value = !showCode.value
  if (showCode.value) void loadSource()
}

watch(shouldMount, (mount) => {
  if (mount) void loadDemo()
})

let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = chromeEl.value
  if (!el || typeof IntersectionObserver === 'undefined') {
    shouldMount.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      shouldMount.value = true
      observer?.disconnect()
      observer = null
    },
    { rootMargin: '200px', threshold: 0 },
  )
  observer.observe(el)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="kablui-demo">
    <div
      v-if="title"
      class="kablui-demo__title"
    >
      {{ title }}
    </div>
    <div
      ref="chromeEl"
      class="kablui-demo__chrome"
    >
      <div class="kablui-demo__label">
        Preview
      </div>
      <div class="kablui-demo__preview vp-raw">
        <div
          v-if="!shouldMount || (key && !DemoComponent && !demoLoadFailed)"
          class="kablui-demo__placeholder"
        >
          Loading preview…
        </div>
        <p
          v-else-if="!key || demoLoadFailed"
          class="kablui-demo__missing"
        >
          Demo not found: <code>{{ src }}</code>
        </p>
        <!-- Client-only: Select/overlays call useDismissible, which touches document at setup. -->
        <ClientOnly v-else-if="DemoComponent">
          <component :is="DemoComponent" />
        </ClientOnly>
      </div>
      <div class="kablui-demo__toolbar">
        <button
          type="button"
          class="kablui-demo__toggle"
          :aria-expanded="showCode"
          @click="toggleCode"
        >
          {{ showCode ? 'Hide code' : 'Code' }}
        </button>
      </div>
      <div
        v-show="showCode"
        class="kablui-demo__source"
      >
        <pre><code>{{ sourceCode ?? 'Loading…' }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kablui-demo__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
  margin: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
