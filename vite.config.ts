import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [vue(), tailwindcss()],
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
      root: 'playground',
      server: {
        port: 5173,
        strictPort: true,
      },
    }
  }

  return {
    plugins: [
      vue(),
      tailwindcss(),
      // Declaration emit is scoped to library sources via tsconfig.lib.json.
      // Build type safety is also gated by `vue-tsc --noEmit -p tsconfig.app.json`
      // in the build script; afterDiagnostic fails the Vite build on dts errors.
      dts({
        include: ['src'],
        exclude: ['src/**/*.{spec,test}.ts', 'src/test/**'],
        outDir: 'dist',
        rollupTypes: true,
        tsconfigPath: './tsconfig.lib.json',
        afterDiagnostic: (diagnostics) => {
          if (diagnostics.length > 0) {
            throw new Error(
              `vite-plugin-dts: ${diagnostics.length} TypeScript diagnostic(s) during declaration emit`,
            )
          }
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'Kablui',
        fileName: 'kablui',
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue',
          },
          assetFileNames: 'kablui.[ext]',
        },
      },
      cssCodeSplit: false,
      sourcemap: true,
      emptyOutDir: true,
    },
  }
})
