import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@test': '/test',
    },
  },
  test: {
    root: './',
    globals: true,
    env: { NODE_ENV: 'test' },
    testTimeout: 10_000,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['**/infra/**', '**/core/**', '**/enterprise/**', '**/main.ts'],
    },
  },
})
