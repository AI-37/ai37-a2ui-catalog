import type {ConstructionsFieldSourceKind} from '@ai37/a2ui-catalog-schemas';

/** Название источника словами — подпись поля, у которого нет `note`. */
const LABELS: Record<ConstructionsFieldSourceKind, string> = {
  project: 'из проекта',
  question: 'из вопроса',
  suggested: 'предложено агентом',
  default: 'принято по умолчанию',
};

export function fieldSourceLabel(source: ConstructionsFieldSourceKind): string {
  return LABELS[source];
}
