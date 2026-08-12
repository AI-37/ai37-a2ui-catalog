import React from 'react';
import {ConstructionsEditorChevron} from './constructions-editor-chevron';
import type {ConstructionsEditorSelectProps} from './constructions-editor.types';

/**
 * Селект в оформлении контрола: нативный вид сброшен (`appearance: none`),
 * стрелка нарисована своим шевроном. Иначе Safari и Chrome рисуют системный
 * контрол со своей высотой и заливкой — в ряду с текстовыми полями он
 * заметно не совпадает.
 */
export function ConstructionsEditorSelect({
  value,
  onChange,
  className,
  children,
}: ConstructionsEditorSelectProps) {
  return (
    <span className="a2ui-ce-select">
      <select value={value} onChange={onChange} className={className}>
        {children}
      </select>
      <span className="a2ui-ce-select__arrow">
        <ConstructionsEditorChevron open />
      </span>
    </span>
  );
}
