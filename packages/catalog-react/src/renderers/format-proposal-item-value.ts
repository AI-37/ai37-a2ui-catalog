import type {ProposalItem} from '@ai37/a2ui-catalog-schemas';
import {RU_MESSAGES, formatMessage, type A2uiMessages} from '../i18n';

/**
 * Значение пункта одной строкой для списка: `1 → 2`, только новое или только
 * прежнее значение. Дата добавляется хвостом `с 01.11.2026`. Пусто — у
 * пункта нет значений, и строка списка состоит из одного `label`.
 */
export function formatProposalItemValue(
  item: ProposalItem,
  messages: A2uiMessages = RU_MESSAGES,
): string {
  const value =
    item.before !== undefined && item.after !== undefined
      ? `${item.before} → ${item.after}`
      : (item.after ?? item.before ?? '');
  if (item.effectiveFrom === undefined) {
    return value;
  }
  const since = formatMessage(messages.proposal.since, {date: item.effectiveFrom});
  return value === '' ? since : `${value} · ${since}`;
}
