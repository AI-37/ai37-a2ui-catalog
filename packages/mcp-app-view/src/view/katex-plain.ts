/**
 * Замена KaTeX в сборке view: формула `LatexFormula` показывается исходным TeX.
 *
 * KaTeX — 270 КБ из бюджета view, а ни один агент не отдаёт `LatexFormula` через
 * MCP. К тому же без `katex.css` (в песочницу его не положить без ещё ~300 КБ
 * шрифтов) его разметка всё равно разваливается. Понадобятся формулы во
 * внешнем клиенте — вернуть KaTeX вместе с CSS и пересмотреть бюджет.
 */
const ESCAPES: Record<string, string> = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'};

function renderToString(formula: string): string {
  return `<code>${formula.replace(/[&<>"]/g, char => ESCAPES[char] ?? char)}</code>`;
}

export default {renderToString};
