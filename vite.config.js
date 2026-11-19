import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    exclude: ['tests/e2e/**', '**/node_modules/**', 'services/account-mailer/**', 'dist/**', '.prerender/**'],
    css: true,
  },
})
