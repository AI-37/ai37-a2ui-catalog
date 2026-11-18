import {RU_MESSAGES, type A2uiMessages} from '../i18n';
import type {SaveToProjectState} from './use-save-to-project';

/** Подпись пункта «Сохранить в проект» в меню «Скачать» отчёта по состоянию сохранения. */
export function saveToProjectLabel(
  state: SaveToProjectState,
  messages: A2uiMessages = RU_MESSAGES,
): string {
  return messages.saveToProject[state];
}
