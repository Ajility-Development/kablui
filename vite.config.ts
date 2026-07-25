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
    }
  }

  return {
    plugins: [
      vue(),
      tailwindcss(),
      dts({
        include: ['src'],
        exclude: ['src/**/*.{spec,test}.ts'],
        outDir: 'dist',
        rollupTypes: true,
        tsconfigPath: './tsconfig.app.json',
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
