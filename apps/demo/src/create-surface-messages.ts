import type {A2uiMessage} from '@a2ui/web_core/v0_9';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

/**
 * Сообщения surface'а из props-фикстуры любого компонента каталога.
 *
 * Обобщение `createThermalReportMessages` на новые витрины (КЕО, инсоляция):
 * props живут только в `fixtures/valid/*.json`, отдельных message-файлов на
 * каждое наполнение не заводим — иначе те же props жили бы в двух копиях.
 */
export function createSurfaceMessages(
  component: string,
  props: Record<string, unknown>,
): A2uiMessage[] {
  return [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component, ...props}],
      },
    },
  ] as unknown as A2uiMessage[];
}
