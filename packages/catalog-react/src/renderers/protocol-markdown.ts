import katex from 'katex';
import {Marked} from 'marked';
import {isProposalHref} from './is-proposal-href';

/**
 * Полный протокол расчёта (markdown агента) → HTML для раскрытого блока
 * «Протокол расчёта».
 *
 * Формулы — TeX: `$…$` в строке и `$$…$$` блоком (так пишут протоколы лифтов,
 * КЕО и теплотехники). KaTeX рендерит их в MathML, а не в HTML-разметку:
 * MathML браузер рисует сам, без `katex.css` и шрифтов. В песочнице MCP App
 * их не положить без ~300 КБ, а в чате spai-ui так не нужно гадать, подключены
 * ли стили. Формулы вырезаются ДО markdown — иначе `_` и `*` внутри TeX
 * markdown съел бы как курсив.
 *
 * Сырой HTML из markdown не проходит: текст протокола собирает агент из
 * ввода пользователя, и `<script>` в подписи поля не должен стать разметкой.
 * По той же причине ссылка остаётся ссылкой, только если адрес — http(s) или
 * путь от корня хоста (правило `isProposalHref`); `javascript:` и прочее —
 * просто текст. Картинок в протоколе нет: `![]()` показывается подписью.
 */
export function renderProtocolMarkdown(source: string): string {
  const formulas: string[] = [];
  const keep = (tex: string, displayMode: boolean): string => {
    formulas.push(renderTex(tex, displayMode));
    return `${MARK}${formulas.length - 1}${MARK}`;
  };

  const text = source
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => `\n\n${keep(tex, true)}\n\n`)
    .replace(/(?<![\\$])\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\d)/g, (_, tex: string) => keep(tex, false));

  const html = markdown.parse(text, {async: false});
  return html.replace(MARK_PATTERN, (_, index: string) => formulas[Number(index)] ?? '');
}

/** Метка места формулы: символы из Private Use Area, в тексте протокола их не бывает. */
const MARK = '\uE000';
const MARK_PATTERN = /\uE000(\d+)\uE000/g;

const markdown = new Marked({
  gfm: true,
  renderer: {
    html: ({text}) => escapeHtml(text),
    link({href, title, tokens}) {
      const text = this.parser.parseInline(tokens);
      if (!isProposalHref(href)) return text;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    },
    image: ({text}) => escapeHtml(text),
  },
});

function renderTex(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex.trim(), {
    displayMode,
    output: 'mathml',
    throwOnError: false,
    strict: 'ignore',
  });
}

const ESCAPES: Record<string, string> = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, char => ESCAPES[char] ?? char);
}
