import type {CalcFieldSourceKind} from '@ai37/a2ui-catalog-schemas';
import {CALC_EDITED_LABEL, calcFieldSourceLabel} from './calc-field-source-label';
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
 * счётчике «5 по допущению» (иначе получалось бы «5 допущение»). Русских
 * числовых форм в компоненте не считаем — падеж выбран так, чтобы работать при
 * любом количестве.
 */
const COUNTER_LABELS: Partial<Record<CalcFieldSourceKind, string>> = {
  assumption: 'по допущению',
};

/**
 * Строка счётчика источников в футере: «1 из проекта · 5 из вашего вопроса ·
 * 5 предложено агентом». Нулевые виды опускаются целиком, порядок фиксирован —
 * сводка не должна перескакивать при правке поля.
 */
export function formatCalcSourceCounter(counts: CalcSourceCounts): string {
  const parts: string[] = [];

  for (const kind of ORDER) {
    const count = counts[kind] ?? 0;
    if (count === 0) continue;

    const label =
      kind === 'edited' ? CALC_EDITED_LABEL : COUNTER_LABELS[kind] ?? calcFieldSourceLabel(kind);
    parts.push(`${count} ${label}`);
  }

  return parts.join(' · ');
}
