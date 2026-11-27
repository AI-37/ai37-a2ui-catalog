import React from 'react';
import {buildConditionsSummary} from './build-conditions-summary';
import {ConstructionsEditorChevron} from './constructions-editor-chevron';
import {ConstructionsEditorGeneral} from './constructions-editor-general';
import type {ConstructionsEditorConditionsProps} from './constructions-editor.types';
import {useA2uiMessages} from '../i18n';

/**
 * Блок «Условия» в шапке экрана — вместо вкладки общих данных. Свёрнутый вид:
 * строка «Условия расчёта» со сводкой значений и кнопкой «Показать»;
 * раскрытый — сетка полей. Переключение локальное: наружу не уезжает ничего,
 * введённое живёт в состоянии редактора и сворачивание его не трогает
 * (Решение 6 design.md).
 */
export function ConstructionsEditorConditions({
  open,
  onToggle,
  ...general
}: ConstructionsEditorConditionsProps) {
  const m = useA2uiMessages();
  if (!open) {
    return (
      <section className="a2ui-ce__group">
        {/* Раскрывается вся строка, как карточка конструкции: «Показать» —
            подпись внутри той же кнопки, отдельного контрола в ней нет. */}
        <button type="button" aria-expanded={false} onClick={onToggle} className="a2ui-ce-banner">
          <ConstructionsEditorChevron open={false} />
          <span className="a2ui-ce-banner__title">{m.constructions.conditionsTitle}</span>
          <span className="a2ui-ce-banner__summary">
            {buildConditionsSummary(general.general, m)}
          </span>
          <span className="a2ui-ce-link">{m.common.show}</span>
        </button>
      </section>
    );
  }

  return (
    <section className="a2ui-ce__group">
      <div className="a2ui-ce-section-head">
        <h3 className="a2ui-ce-section-title">{m.constructions.conditions}</h3>
        <button type="button" onClick={onToggle} className="a2ui-ce-link">
          {m.common.collapse}
        </button>
      </div>
      <ConstructionsEditorGeneral {...general} />
    </section>
  );
}
