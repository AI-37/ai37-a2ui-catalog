import type {ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';

/**
 * Логгер черновиков ConstructionsEditor'а для демо.
 *
 * Настоящий агент на `draftAction` кладёт массив в состояние сессии; здесь
 * достаточно вывести payload в консоль — видно, что каждый коммит (add/remove
 * конструкции, «Применить»/«Добавить»/«Удалить слой» формы слоя, «Сохранить»
 * формы шапки, «Применить» формы паспортного Rпр) шлёт полный массив, а ввод
 * внутри ещё не закоммиченной формы и «Отмена» — нет.
 */
export function attachDemoDraftLogger(
  processor: MessageProcessor<ComponentApi>,
  surfaceId: string,
  draftAction: string,
): void {
  const surface = processor.model.getSurface(surfaceId);
  if (!surface) return;

  surface.onAction.subscribe(action => {
    if (action.name !== draftAction) return;
    // eslint-disable-next-line no-console
    console.log('[demo] draft', action.context?.constructions);
  });
}
