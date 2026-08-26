import type {A2uiMessage, ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';
import type {KeoEditorProps} from '@ai37/a2ui-catalog-schemas';

/**
 * Локальная имитация агент-хоста для автосохранения `KeoEditorNext`.
 *
 * Настоящий агент на `draftAction` кладёт черновик в состояние задачи и
 * отвечает САМОДОСТАТОЧНЫМ снапшотом с теми же id: сообщение заменяется на
 * месте, нового в треде не появляется. Здесь это же — тот же `updateComponents`
 * на тот же `id` компонента.
 *
 * Отвечает он ради подписи под условием: следствие значения («группа светового
 * климата») считает агент, и компонент обязан получить его пересчитанным, а не
 * гасить строку. Текст здесь демонстрационный — нормативной таблицы у демо нет
 * и быть не должно, её знает агент.
 */
export function attachDemoKeoDraftHost(
  processor: MessageProcessor<ComponentApi>,
  surfaceId: string,
  draftAction: string,
  props: KeoEditorProps,
): void {
  const surface = processor.model.getSurface(surfaceId);
  if (!surface) return;

  surface.onAction.subscribe(action => {
    if (action.name !== draftAction) return;

    const draft = action.context as {
      conditions: Record<string, string>;
      rooms: Array<{name: string; values: Record<string, unknown>}>;
    };

    processor.processMessages([
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId,
          components: [
            {
              id: 'root',
              component: 'KeoEditorNext',
              ...props,
              draftAction,
              conditions: props.conditions.map(condition => {
                const value = draft.conditions[condition.name] ?? condition.value;

                return {
                  ...condition,
                  value,
                  note: `световой климат для «${value}» — пересчитал агент (демо)`,
                };
              }),
              // Черновик кладётся как есть: снапшот возвращает те же значения,
              // включая пустые и только что добавленное помещение.
              rooms: draft.rooms.map((room, position) => ({
                ...props.rooms[position],
                values: room.values,
              })),
            },
          ],
        },
      } as unknown as A2uiMessage,
    ]);
  });
}
