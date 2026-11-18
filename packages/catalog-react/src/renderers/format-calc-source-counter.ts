import type {CalcFieldSourceKind} from '@ai37/a2ui-catalog-schemas';
import {RU_MESSAGES, type A2uiMessages} from '../i18n';
import {calcFieldSourceLabel} from './calc-field-source-label';
import type {CalcSourceCounts} from './calc-editor.types';

/** Порядок слагаемых счётчика: от самого надёжного источника к правкам. */
const ORDER: readonly (CalcFieldSourceKind | 'edited')[] = [
  'project',
  'question',
  'suggested',
  'calculated',
  'assumption',
  'edited',
];

/**
 * Слагаемое счётчика читается «{число} {метка}», а подпись поля — сама по себе,
 * поэтому у `assumption` формы расходятся: под контролом «допущение», в
 * счётчике «5 по допущению» (иначе получалось бы «5 допущение»). Числовых форм
 * в компоненте не считаем — подписи подобраны так, чтобы работать при любом
 * количестве.
 */
function counterLabel(kind: CalcFieldSourceKind | 'edited', messages: A2uiMessages): string {
  if (kind === 'edited') return messages.calcSource.edited;
  if (kind === 'assumption') return messages.calcSource.assumptionCounter;
  return calcFieldSourceLabel(kind, messages);
}

/**
 * Строка счётчика источников в футере: «1 из проекта · 5 из вашего вопроса ·
 * 5 предложено агентом». Нулевые виды опускаются целиком, порядок фиксирован —
 * сводка не должна перескакивать при правке поля.
 */
export function formatCalcSourceCounter(
  counts: CalcSourceCounts,
  messages: A2uiMessages = RU_MESSAGES,
): string {
  const parts: string[] = [];

  for (const kind of ORDER) {
    const count = counts[kind] ?? 0;
    if (count === 0) continue;

    parts.push(`${count} ${counterLabel(kind, messages)}`);
  }

  return parts.join(' · ');
}
