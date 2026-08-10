import type {A2uiMessage} from '@a2ui/web_core/v0_9';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

/**
 * Сообщения surface'а из props-фикстуры `LiftEditor`.
 *
 * Сквозное сообщение в `fixtures/messages` одно (ветка с повторяемыми лифтами);
 * вторая витрина — та же схема, но с активной методикой лифтовой группы, и
 * заводить ради неё ещё один message-файл незачем.
 */
export function createLiftEditorMessages(props: Record<string, unknown>): A2uiMessage[] {
  return [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'LiftEditor', ...props}],
      },
    },
  ] as unknown as A2uiMessage[];
}
