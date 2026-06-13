import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['../../'],
    },
  },
  resolve: {
    alias: {
      '@ai37/a2ui-catalog-schemas': path.resolve(__dirname, '../../packages/catalog-schemas/src/index.ts'),
      '@ai37/a2ui-catalog-react': path.resolve(__dirname, '../../packages/catalog-react/src/index.ts'),
    },
  },
});