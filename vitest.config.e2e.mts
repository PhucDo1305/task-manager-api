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
    testTimeout: 10_000,
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup-e2e.ts'],
  },
})
