import { defineConfig } from 'tsup';

// Dual ESM + CJS (по образцу catalog-schemas): esbuild бандлит внутренние модули,
// externalize-ит zod/zod-to-json-schema. Один entry — весь реестр + генераторы схем.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  treeshake: true,
});
