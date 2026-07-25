import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const fixturesRoot = resolve(__dirname)
const projectRoot = resolve(__dirname, '../../..')

export default defineConfig({
  root: fixturesRoot,
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
    },
  },
  server: {
    port: 4173,
    strictPort: true,
  },
})
