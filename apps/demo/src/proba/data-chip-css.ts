/**
 * Двухчастная пилюля «label value» блока «Исходные данные». В наборе `Chip`
 * одночастный — здесь к нему добавлены две оси: две части в одной пилюле и
 * пунктирная рамка («принято системой — проверьте»: значение не введено, а
 * подставлено, и рамка об этом говорит раньше подписи группы).
 *
 * Модификаторы объявлены тремя классами: у `.a2ui-chip` свои отступы, и при
 * равной специфичности победил бы порядок стилевых тегов.
 */
export const PROBA_DATA_CHIP_CSS = `
.a2ui-kit .a2ui-chip.a2ui-chip--data {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  color: var(--a2ui-text-color);
}

.a2ui-kit .a2ui-chip.a2ui-chip--dashed { border-style: dashed; }

.a2ui-kit .a2ui-chip__label { color: var(--a2ui-text-color-muted); }
.a2ui-kit .a2ui-chip__value { font-weight: var(--a2ui-text-weight-strong); }
`;
