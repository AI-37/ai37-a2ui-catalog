import {defineConfig} from 'tsup';

// Серверная часть пакета (протокол + помощники результата) — ESM с расширениями
// в импортах, чтобы грузилась в Node без бандлера. HTML view собирает vite,
// и строку с ним к этой части добавляет scripts/emit-entry.mjs.
export default defineConfig({
  entry: {lib: 'src/index.ts'},
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: false,
  target: 'es2022',
  treeshake: true,
});
