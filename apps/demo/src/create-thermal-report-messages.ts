import type {A2uiMessage} from '@a2ui/web_core/v0_9';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

/**
 * Сообщения surface'а из props-фикстуры `ThermalReport`.
 *
 * Обе витрины (одна конструкция / список из 7) собираются из
 * `fixtures/valid/thermal-report-*.json` — отдельные message-файлы не
 * заводим, чтобы props не жили в двух копиях (прецедент — лифтовая группа).
 */
export function createThermalReportMessages(props: Record<string, unknown>): A2uiMessage[] {
  return [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'ThermalReport', ...props}],
      },
    },
  ] as unknown as A2uiMessage[];
}
