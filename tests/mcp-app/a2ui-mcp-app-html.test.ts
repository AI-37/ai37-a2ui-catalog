import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {describe, expect, it} from 'vitest';

/**
 * Бюджет HTML view. Цель плана — ≤ 800 КБ; на 24.11.2026 view весит ~1,10 МБ
 * (React + @base-ui ≈ 40 %, два zod — у каталога 3.x, у web_core и MCP SDK 4.x,
 * MCP client SDK 2.x, все рендереры каталога). Порог фиксирует факт с запасом
 * ~1,5 % и не даёт расти: поднимать его — отдельное решение с замером в PR.
 *
 * 0.50.0: 1 105 234 → 1 411 901 байт (+307 КБ) — KaTeX (MathML-вывод, без CSS и
 * шрифтов) и marked: раскрытый протокол расчёта показывает формулы во внешнем
 * клиенте (Claude, ChatGPT). Запас ~2,7 %.
 */
const HTML_BUDGET_BYTES = 1_450_000;

const dist = path.join(process.cwd(), 'packages/mcp-app-view/dist');
const htmlFile = path.join(dist, 'a2ui-mcp-app.html');
const pythonCopy = path.join(
  process.cwd(),
  'packages/catalog-python/src/ai37_a2ui_catalog/mcp_app/a2ui-mcp-app.html',
);

function readHtml(): string {
  if (!fs.existsSync(htmlFile)) {
    throw new Error('Нет packages/mcp-app-view/dist/a2ui-mcp-app.html — сначала pnpm run build');
  }
  return fs.readFileSync(htmlFile, 'utf8');
}

describe('HTML view @ai37/a2ui-mcp-app', () => {
  it(`укладывается в бюджет ${HTML_BUDGET_BYTES} байт`, () => {
    expect(Buffer.byteLength(readHtml())).toBeLessThanOrEqual(HTML_BUDGET_BYTES);
  });

  it('один файл: ни скриптов, ни стилей по ссылке — песочница хоста их не пустит', () => {
    const html = readHtml();

    expect(html).not.toMatch(/<script[^>]+\bsrc=/i);
    expect(html).not.toMatch(/<link[^>]+rel=["']?stylesheet/i);
  });

  it('A2UI_MCP_APP_HTML из входа пакета — тот же файл, и протокол рядом', async () => {
    const entry = (await import(pathToFileURL(path.join(dist, 'index.js')).href)) as Record<
      string,
      unknown
    >;

    expect(entry.A2UI_MCP_APP_HTML).toBe(readHtml());
    expect(entry.A2UI_META_KEY).toBe('ai37/a2ui');
    expect(typeof entry.a2uiAppResult).toBe('function');
  });

  it('Python-пакет кладёт в колесо тот же HTML', () => {
    expect(fs.readFileSync(pythonCopy, 'utf8')).toBe(readHtml());
  });
});
