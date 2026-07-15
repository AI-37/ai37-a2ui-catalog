import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

/**
 * HtmlTable — доверенный рендер таблицы, хранимой как HTML (нормативные документы:
 * СП/ГОСТ). В отличие от FlexTable (строковые ячейки) сохраняет ПОЛНУЮ верность
 * исходной таблицы: объединённые ячейки (rowspan/colspan), вложенный контент, сноски —
 * бесплатно за счёт нативного <table>. HTML санитизируется рендерером (DOMPurify) —
 * компонент рассчитан на HTML из доверенного индекса документов, НЕ на произвольный
 * HTML от LLM. Тему задаёт рендерер (маппинг на --a2ui-* токены), стили документа не
 * протекают в приложение.
 */
export const htmlTablePropsSchema = z
  .object({
    /** HTML таблицы (обычно один <table>…</table>). Санитизируется при рендере. */
    html: z.string().min(1),
    /** Заголовок карточки (напр. «Таблица 2»). */
    title: z.string().min(1).max(120).optional(),
    /** Пояснительная подпись под заголовком. */
    caption: z.string().min(1).max(240).optional(),
    /** Код документа-источника (напр. «СП 4.13130.2013»). */
    sourceCode: z.string().min(1).max(120).optional(),
    /** Название документа-источника. */
    sourceTitle: z.string().min(1).max(240).optional(),
  })
  .strict();

export type HtmlTableProps = z.infer<typeof htmlTablePropsSchema>;

export const htmlTableDefinition: CatalogComponentDefinition<typeof htmlTablePropsSchema> = {
  name: 'HtmlTable',
  slug: 'html-table',
  description:
    'A faithfully-rendered document table supplied as sanitized HTML. Use it for complex source tables (merged cells, footnotes, nested content) from trusted documents where a structured cell grid would lose fidelity. Not for arbitrary/LLM-authored HTML.',
  schema: htmlTablePropsSchema,
};
