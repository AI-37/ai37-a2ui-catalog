/** Идентификатор методики расчёта. */
export type GostId = '52941' | '34758';

/** Раздел документа расчёта, к которому относится поле. */
export type FieldSection = 'building' | 'lift';

/**
 * Тип значения поля (задаёт построение zod и JSON Schema):
 *  - `int` / `number` — числовое (с опциональными min/max);
 *  - `enum-number` — число из фиксированного ряда ГОСТ (union литералов → JSON Schema enum);
 *  - `enum-string` — строка из фиксированного набора.
 */
export type FieldKind = 'int' | 'number' | 'enum-number' | 'enum-string';

/**
 * Единый дескриптор поля расчёта — SOURCE OF TRUTH. Из него генерятся: zod-схема structured-tool,
 * JSON Schema для `skillsIo.input`, список обязательных полей для `collectMissing`, метки формы.
 *
 * Классификация обязательности (одно правило, устраняет рассинхрон):
 *  - `default !== undefined` → типовое значение, пользователь может не задавать;
 *  - `auto: true` → производное значение (elevator доставит: VN_TABLE / lookupTost / Pk), optional;
 *  - иначе → ОБЯЗАТЕЛЬНОЕ (пользователь должен задать). См. `isRequired`.
 */
export interface FieldDescriptor {
  key: string;
  section: FieldSection;
  /** Человекочитаемая метка (форма, сообщения об ошибке). */
  label: string;
  /** Описание для zod `.describe()` / JSON Schema `description` (видит LLM). */
  describe: string;
  kind: FieldKind;
  /** Допустимые значения (для enum-*). */
  allowed?: readonly (number | string)[];
  /** Статический типовой дефолт. */
  default?: number | string;
  /** Производное значение — optional в схеме, проставляется агентом до расчёта. */
  auto?: boolean;
  min?: number;
  max?: number;
}

/** Поле, отсутствующее во вводе (для структурной ошибки валидации и `collectMissing`). */
export interface MissingField {
  field: string;
  label: string;
  allowed?: readonly (number | string)[];
}

/** Поле обязательно к вводу пользователем: нет ни статического дефолта, ни авто-производности. */
export function isRequired(field: FieldDescriptor): boolean {
  return field.default === undefined && !field.auto;
}
