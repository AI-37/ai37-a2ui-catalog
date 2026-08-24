/**
 * Словарь провенанса переехал в примитивы вместе с подписью `SourceNote`
 * (change `lift-editor-next`): подпись и её словарь — одно целое, а рендереры
 * ссылаются на общий адрес. Реэкспорт оставлен, чтобы нынешние рендереры
 * (`ConstructionsEditor`, `LiftEditor`, calc-экраны) не правились ради переезда.
 */
export {fieldSourceLabel} from '../primitives/field-source-label';
