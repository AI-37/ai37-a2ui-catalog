import type {ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';

/**
 * Логгер ВСЕХ action'ов surface'а для витрины `LiftEditor`.
 *
 * Главное свойство компонента — «ни одного сетевого действия до submit», и
 * проверяется оно именно так: вкладки, добавление лифта, смена методики и
 * авто-подстановки в консоли не появляются, а по «Рассчитать» приходит ровно
 * одна строка с полным документом.
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
