import type {A2uiMessage} from '@a2ui/web_core/v0_9';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

/**
 * Сообщения surface'а из props-фикстуры `LiftReport`.
 *
 * Витрина собирается из `fixtures/valid/lift-report.json` — отдельный
 * message-файл не заводим, чтобы props не жили в двух копиях (прецедент —
 * create-thermal-report-messages).
 */
export function createLiftReportMessages(props: Record<string, unknown>): A2uiMessage[] {
  return [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'LiftReport', ...props}],
      },
    },
  ] as unknown as A2uiMessage[];
}
