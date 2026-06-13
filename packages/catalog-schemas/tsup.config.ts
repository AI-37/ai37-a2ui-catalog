import { defineConfig } from 'tsup';

// Dual ESM + CJS сборка с корректными расширениями и declaration-файлами.
// Фикс публикации: tsc с moduleResolution:Bundler эмитил extensionless-импорты
// (./constants вместо ./constants.js), из-за чего пакет не грузился в Node ESM.
// esbuild (tsup) бандлит внутренние модули и externalize-ит зависимости.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  treeshake: true,
});
