import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'custom',
      customProviderModule: path.resolve(__dirname, 'node_modules/@vitest/coverage-v8'),
      reporter: ['text', 'json', 'html'],
      include: ['src/modules/**/application/**'],
      exclude: ['src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
