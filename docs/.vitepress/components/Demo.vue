<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  /** Path to a demo SFC, relative to the current markdown page. */
  src: string
  /** Optional heading above the preview. */
  title?: string
}>()

const { page } = useData()
const showCode = ref(false)

const modules = import.meta.glob('../../components/demos/**/*.vue', {
  eager: true,
  import: 'default',
}) as Record<string, Component>

const sources = import.meta.glob('../../components/demos/**/*.vue', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

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

const DemoComponent = computed(() => (key.value ? modules[key.value] : null))

const sourceCode = computed(() =>
  key.value && sources[key.value]
    ? sources[key.value]
    : `<!-- Demo not found: ${props.src} -->`,
)
</script>

<template>
  <div class="kablui-demo">
    <div
      v-if="title"
      class="kablui-demo__title"
    >
      {{ title }}
    </div>
    <div class="kablui-demo__chrome">
      <div class="kablui-demo__label">
        Preview
      </div>
      <div class="kablui-demo__preview vp-raw">
        <!-- Client-only: Select/overlays call useDismissible, which touches document at setup. -->
        <ClientOnly v-if="DemoComponent">
          <component :is="DemoComponent" />
        </ClientOnly>
        <p
          v-else
          class="kablui-demo__missing"
        >
          Demo not found: <code>{{ src }}</code>
        </p>
      </div>
      <div class="kablui-demo__toolbar">
        <button
          type="button"
          class="kablui-demo__toggle"
          :aria-expanded="showCode"
          @click="showCode = !showCode"
        >
          {{ showCode ? 'Hide code' : 'Code' }}
        </button>
      </div>
      <div
        v-show="showCode"
        class="kablui-demo__source"
      >
        <pre><code>{{ sourceCode }}</code></pre>
      </div>
    </div>
  </div>
</template>
