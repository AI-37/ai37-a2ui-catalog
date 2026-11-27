import type {LiftEditorDependentRule, LiftEditorFieldNote} from '@ai37/a2ui-catalog-schemas';
import {liftValuesMatch} from './lift-values-match';
import type {LiftFieldNotes, LiftFieldValues} from './lift-editor.types';

/**
 * Подписи под полями одного лифта от строк правил с `note` (change
 * `lift-editor-note-rules`). Совпадение считается так же, как у `set`: первая
 * строка правила, чей `when` совпал со значениями `sources` по порядку.
 * Строка без `note` (только `set`) подписи не даёт. Значения берутся ТЕКУЩИЕ —
 * после подстановок, поэтому подпись следует и за ручным вводом, и за
 * «Применить» у варианта подбора. На одно поле побеждает первое правило.
 */
export function collectRuleNotes(
  rules: readonly LiftEditorDependentRule[],
  building: LiftFieldValues,
  lift: LiftFieldValues,
): LiftFieldNotes {
  const notes: Record<string, LiftEditorFieldNote> = {};

  for (const rule of rules) {
    const sourceValues = rule.sources.map(source =>
      source.scope === 'building' ? building[source.field] : lift[source.field],
    );

    const row = rule.rows.find(candidate =>
      candidate.when.every((expected, index) => liftValuesMatch(expected, sourceValues[index])),
    );

    if (row?.note === undefined || notes[row.note.field] !== undefined) continue;
    notes[row.note.field] = row.note;
  }

  return notes;
}
