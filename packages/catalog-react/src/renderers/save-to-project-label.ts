import type {SaveToProjectState} from './use-save-to-project';

const LABELS: Record<SaveToProjectState, string> = {
  idle: 'Сохранить в проект',
  saving: 'Сохраняю…',
  saved: 'В проекте',
  failed: 'Не удалось сохранить, ещё раз',
};

/** Подпись пункта «Сохранить в проект» в меню «Скачать» отчёта по состоянию сохранения. */
export function saveToProjectLabel(state: SaveToProjectState): string {
  return LABELS[state];
}
