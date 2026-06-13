import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@a2ui/react/v0_9': require.resolve('@a2ui/react/v0_9'),
      '@a2ui/web_core/v0_9': require.resolve('@a2ui/web_core/v0_9'),
      '@a2ui/web_core/v0_9/basic_catalog': require.resolve('@a2ui/web_core/v0_9/basic_catalog'),
      '@ai37/a2ui-catalog-schemas': path.resolve(process.cwd(), 'packages/catalog-schemas/src/index.ts'),
      '@ai37/a2ui-catalog-react': path.resolve(process.cwd(), 'packages/catalog-react/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/react/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});