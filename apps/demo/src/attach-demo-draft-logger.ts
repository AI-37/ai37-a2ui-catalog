import type {ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';

/**
 * Логгер черновиков ConstructionsEditor'а для демо.
 *
 * Настоящий агент на `draftAction` кладёт payload в состояние сессии; здесь
 * достаточно вывести его в консоль — видно, что каждый коммит (add/remove
 * конструкции, «Применить»/«Добавить»/«Удалить слой» формы слоя, «Сохранить»
 * формы шапки, «Применить» формы паспортного Rпр) шлёт полное состояние сразу,
 * серия правок полей условий схлопывается дебаунсом в один черновик после
 * паузы ввода, а ввод внутри ещё не закоммиченной формы и «Отмена» не шлют
 * ничего.
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
    console.log('[demo] draft', action.context);
  });
}
