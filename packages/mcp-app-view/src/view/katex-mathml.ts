import type {KatexOptions} from 'katex';
import katex from 'katex/dist/katex.mjs';

/**
 * KaTeX в сборке view — только MathML. HTML-разметке KaTeX нужны `katex.css`
 * и шрифты (~300 КБ), в песочницу их не положить; MathML браузер рисует сам.
 * Так формулы показывают и `LatexFormula`, и раскрытый протокол расчёта.
 */
function renderToString(formula: string, options: KatexOptions = {}): string {
  return katex.renderToString(formula, {...options, output: 'mathml'});
}

export default {renderToString};
