import type {ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';

/**
 * Логгер черновиков ConstructionsEditor'а для демо.
 *
 * Настоящий агент на `draftAction` кладёт массив в состояние сессии; здесь
 * достаточно вывести payload в консоль — видно, что структурная правка
 * (add/remove конструкции или слоя) шлёт полный массив, а правка поля нет.
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
