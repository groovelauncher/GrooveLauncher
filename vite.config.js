import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: './vue-src',
  build: {
    outDir: '../www/dist',
    emptyOutDir: false, // Don't empty the dist directory as it contains existing files
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'vue-src/main.js'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'vue-src'),
      '@assets': resolve(__dirname, 'www/assets'),
    },
  },
})
