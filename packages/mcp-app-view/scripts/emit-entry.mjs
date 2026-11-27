/**
 * Склеивает публичный вход пакета после сборки:
 *  - `dist/html.js` — HTML view строкой (`A2UI_MCP_APP_HTML`), чтобы агент отдавал
 *    ресурс без чтения файлов и без знания, где лежит node_modules;
 *  - `dist/index.js` — протокол и помощники (`dist/lib.js`) плюс эта строка;
 *  - копия HTML в Python-пакет: `ai37_a2ui_catalog.mcp_app.html()` отдаёт тот же файл.
 */
import {copyFileSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const htmlFile = path.join(dist, 'a2ui-mcp-app.html');
const html = readFileSync(htmlFile, 'utf8');

writeFileSync(path.join(dist, 'html.js'), `export const A2UI_MCP_APP_HTML = ${JSON.stringify(html)};\n`);
writeFileSync(
  path.join(dist, 'html.d.ts'),
  '/** Однофайловый HTML view «A2UI-поверхность внутри MCP App» (MIME `text/html;profile=mcp-app`). */\n' +
    'export declare const A2UI_MCP_APP_HTML: string;\n',
);

const entry = "export * from './lib.js';\nexport {A2UI_MCP_APP_HTML} from './html.js';\n";
writeFileSync(path.join(dist, 'index.js'), entry);
writeFileSync(path.join(dist, 'index.d.ts'), entry);

copyFileSync(
  htmlFile,
  path.resolve(root, '../catalog-python/src/ai37_a2ui_catalog/mcp_app/a2ui-mcp-app.html'),
);

process.stdout.write(`a2ui-mcp-app.html: ${Buffer.byteLength(html)} байт\n`);
