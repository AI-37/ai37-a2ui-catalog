import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';
import path from 'node:path';

const packages = path.resolve(import.meta.dirname, '..');

/**
 * Zod 4 реэкспортирует `locales` — сообщения об ошибках на ~50 языках. Код
 * передаёт `z` целиком, и rollup не может выбросить ни одного. View нужны
 * только английские сообщения по умолчанию (`config(en())` в самом zod) —
 * остальные ~100 КБ уходят из бюджета.
 */
function zodEnglishOnly(): Plugin {
  return {
    name: 'ai37-zod-english-only',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (source !== '../locales/index.js' || !/\/zod\/v4\/(classic|core|mini)\//.test(importer ?? '')) return null;
      const en = await this.resolve('../locales/en.js', importer);
      return en === null ? null : `\0zod-locales:${en.id}`;
    },
    load(id) {
      if (!id.startsWith('\0zod-locales:')) return null;
      return `export {default as en} from ${JSON.stringify(id.slice('\0zod-locales:'.length))};`;
    },
  };
}

/**
 * View — один HTML без внешних ресурсов: хост MCP Apps отдаёт его ресурсом
 * `ui://…` в песочницу, где CSP закрыт. Каталог берётся из исходников
 * workspace (как в vitest), а не из `dist`: сборка view не зависит от порядка
 * сборки пакетов. KaTeX заменён показом исходного TeX — см. katex-plain.ts.
 */
export default defineConfig({
  plugins: [zodEnglishOnly(), react(), viteSingleFile()],
  resolve: {
    alias: [
      {
        find: '@ai37/a2ui-catalog-schemas',
        replacement: path.join(packages, 'catalog-schemas/src/index.ts'),
      },
      {
        find: '@ai37/a2ui-catalog-react',
        replacement: path.join(packages, 'catalog-react/src/index.ts'),
      },
      {find: /^katex$/, replacement: path.resolve(import.meta.dirname, 'src/view/katex-plain.ts')},
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {input: path.resolve(import.meta.dirname, 'a2ui-mcp-app.html')},
  },
});
