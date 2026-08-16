import React from 'react';
import type {LiftEditorHeaderProps} from './lift-editor.types';

/**
 * Шапка карточки: заголовок слева, справа — контекст агента (имя проекта) и
 * переключатель методики. Рисуется только при заданном `headerTitle`; без
 * него переключатель показывается первым элементом над секциями (fallback в
 * корне редактора).
 */
export function LiftEditorHeader({title, context, switcher}: LiftEditorHeaderProps) {
  return (
    <header className="a2ui-le__header">
      <span className="a2ui-le__header-title">{title}</span>
      {context !== undefined ? <span className="a2ui-le__header-context">{context}</span> : null}
      {switcher}
    </header>
  );
}
