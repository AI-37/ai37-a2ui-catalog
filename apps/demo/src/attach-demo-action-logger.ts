import type {ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';

/**
 * Логгер ВСЕХ action'ов surface'а для витрины `LiftEditor`.
 *
 * Витрина включает `draftAction`, поэтому в консоли видно оба потока: черновик
 * на границах экранов (вкладка, добавление и удаление лифта, смена методики) и
 * на blur изменённого поля — и ровно одна строка submit'а по «Рассчитать».
 * Проход по полям табом и повторный триггер на том же состоянии строк не дают.
 */
export function attachDemoActionLogger(
  processor: MessageProcessor<ComponentApi>,
  surfaceId: string,
  label: string,
): void {
  const surface = processor.model.getSurface(surfaceId);
  if (!surface) return;

  surface.onAction.subscribe(action => {
    // eslint-disable-next-line no-console
    console.log(`[demo] ${label} → ${action.name}`, action.context);
  });
}
