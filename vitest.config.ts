import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './tests/coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/types/**',
        'src/vite-env.d.ts',
      ],
      // 当前阈值设置较低，随着测试覆盖率提高可逐步提升
      thresholds: {
        statements: 10,
        branches: 50,
        functions: 10,
        lines: 10,
      },
    },
  },
});
