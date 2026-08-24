import type {ConstructionsFieldSourceKind} from '@ai37/a2ui-catalog-schemas';

/**
 * Название источника словами — подпись поля, у которого нет `note`. Общий
 * словарь провенанса каталога: им пользуются и `ConstructionsEditor`, и
 * `LiftEditor` (схема источника у них одна — `liftEditorFieldSourceSchema`
 * переиспользует констракшновскую).
 */
const LABELS: Record<ConstructionsFieldSourceKind, string> = {
  project: 'из проекта',
  question: 'из вопроса',
  suggested: 'предложено агентом',
  default: 'принято по умолчанию',
};

export function fieldSourceLabel(source: ConstructionsFieldSourceKind): string {
  return LABELS[source];
}
