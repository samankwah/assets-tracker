import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'dist/',
        'build/',
        'coverage/',
        'public/',
        '*.config.js',
        '*.config.ts'
      ]
    }
  }
})