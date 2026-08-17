import type {CalcFieldSources} from '@ai37/a2ui-catalog-schemas';
import {createLocalId} from './create-local-id';
import type {CalcScreenState} from './calc-editor.types';

/** Экран из props: помещение КЕО, расчётная точка или затеняющее здание. */
interface CalcScreenInput {
  name?: string | undefined;
  values: Record<string, unknown>;
  sources?: CalcFieldSources | undefined;
}

/**
 * Рабочие копии повторяемых экранов: значения копируются (правки не мутируют
 * props), источники нормализуются до пустого объекта, id выдаётся клиентский.
 * Новое сообщение агента — новые id: state пересевается целиком, как у
 * FormCard/ConstructionsEditor/LiftEditor.
 */
export function createCalcScreens(screens: readonly CalcScreenInput[]): CalcScreenState[] {
  return screens.map(screen => ({
    id: createLocalId(),
    name: screen.name,
    values: {...screen.values},
    sources: {...(screen.sources ?? {})},
  }));
}
