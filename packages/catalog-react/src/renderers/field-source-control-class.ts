import type {ConstructionsFieldSource} from '@ai37/a2ui-catalog-schemas';

/**
 * Класс контрола по источнику значения: `project` — заливка (значение пришло
 * готовым), `question`/`suggested` — акцентная рамка (значение предложено и
 * ждёт проверки), `default` — обычный контрол, источник виден только подписью.
 *
 * Тронутое пользователем поле источника не имеет: значение стало
 * пользовательским, и оформление снимается (Решение 5 design.md).
 */
export function fieldSourceControlClass(source: ConstructionsFieldSource | undefined): string {
  if (source === undefined) return 'a2ui-ce-control';
  if (source.source === 'project') return 'a2ui-ce-control a2ui-ce-control--project';
  if (source.source === 'default') return 'a2ui-ce-control';

  return 'a2ui-ce-control a2ui-ce-control--suggested';
}
