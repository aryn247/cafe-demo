import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Using relative path so it works on any GitHub Pages subdirectory
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
