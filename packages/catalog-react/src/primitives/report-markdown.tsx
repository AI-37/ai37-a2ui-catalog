import React from 'react';
import Markdown from 'react-markdown';
import type {Components} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {ReportMarkdownTable} from './report-markdown-table';

/**
 * Markdown отчёта: разделы, списки, таблицы и формулы протокола расчёта.
 *
 * Формулы приходят долларами (`$…$`, `$$…$$`) — их разбирает `remark-math`, а
 * рисует `rehype-katex` **на сервере разметки**, а не обходом DOM: карточка
 * живёт внутри чужой ленты, и второй проход по смонтированному дереву цеплял
 * бы соседние сообщения.
 *
 * **Шрифты KaTeX подключает хост** (`katex/dist/katex.min.css`) — тот же
 * контракт, что у `LatexFormula`: пакет каталога не тащит чужую таблицу стилей
 * в чужую страницу. Без неё формулы отрисуются, но браузерным шрифтом.
 *
 * Сырой HTML НЕ рендерится (`rehype-raw` не подключён): содержимое приходит от
 * агента через props, и разметка в нём — данные, а не разрешение выполнять
 * чужой markup.
 */
export function ReportMarkdown({content}: {content: string}) {
  return (
    <div className="a2ui-md">
      <Markdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={COMPONENTS}>
        {content}
      </Markdown>
    </div>
  );
}

/* Модульные константы, а не литералы в JSX: новый массив на каждый рендер
   пересобирал бы конвейер плагинов при каждом раскрытии карточки. */
const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeKatex];
const COMPONENTS: Components = {table: ReportMarkdownTable};
