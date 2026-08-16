import React from 'react';
import type {LiftEditorMethodSwitcherProps} from './lift-editor.types';

/**
 * Переключатель методики: свёрнутый вид — текст «{gostLabel} · {тип здания}»,
 * поверх которого лежит прозрачный нативный select с опциями из
 * `methodConfigs[].label` — клик по тексту открывает выбор. Текст собирается
 * на клиенте из живого значения `buildingType` (или `buildingKindLabel`
 * конфига): строка от агента протухла бы после первой правки (Решение 2
 * design lift-editor-sections-responsive).
 */
export function LiftEditorMethodSwitcher({
  configs,
  method,
  fieldLabel,
  buildingKind,
  onChange,
}: LiftEditorMethodSwitcherProps) {
  const active = configs.find(config => config.method === method);
  const gost = active?.gostLabel ?? method;
  const text = buildingKind === '' ? gost : `${gost} · ${buildingKind}`;

  return (
    <span className="a2ui-le-method">
      <span className="a2ui-le-method__text">{text}</span>
      <span className="a2ui-le-method__chevron" aria-hidden="true">
        ⌄
      </span>
      <select
        name="method"
        className="a2ui-le-method__select"
        aria-label={fieldLabel}
        value={method}
        onChange={event => onChange(event.target.value)}
      >
        {configs.map(config => (
          <option key={config.method} value={config.method}>
            {config.label}
          </option>
        ))}
      </select>
    </span>
  );
}
