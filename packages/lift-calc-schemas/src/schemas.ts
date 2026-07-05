import { z } from 'zod';
import { FIELDS_52941, FIELDS_34758, REGISTRY } from './registry';
import { isRequired, type FieldDescriptor, type GostId, type MissingField } from './types';

/** Базовый zod-тип поля (без учёта обязательности). */
function baseZod(field: FieldDescriptor): z.ZodTypeAny {
  switch (field.kind) {
    case 'int': {
      let s = z.number().int();
      if (field.min !== undefined) s = s.min(field.min);
      if (field.max !== undefined) s = s.max(field.max);
      return s;
    }
    case 'number': {
      let s = z.number();
      if (field.min !== undefined) s = s.min(field.min);
      if (field.max !== undefined) s = s.max(field.max);
      return s;
    }
    case 'enum-number': {
      const opts = (field.allowed ?? []) as readonly number[];
      const literals = opts.map((v) => z.literal(v));
      return z.union(
        literals as [z.ZodLiteral<number>, z.ZodLiteral<number>, ...z.ZodLiteral<number>[]],
      );
    }
    case 'enum-string': {
      const opts = (field.allowed ?? []) as readonly string[];
      return z.enum(opts as [string, ...string[]]);
    }
  }
}

/** Поле → zod с учётом обязательности: default → типовое; auto → optional; иначе обязательное. */
function fieldZod(field: FieldDescriptor): z.ZodTypeAny {
  const base = baseZod(field).describe(field.describe);
  if (field.default !== undefined) return base.default(field.default);
  if (field.auto) return base.optional();
  return base;
}

function buildShape(fields: readonly FieldDescriptor[]): z.ZodRawShape {
  // zod 4: ZodRawShape — readonly index signature, собираем в mutable и приводим на возврате.
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) shape[field.key] = fieldZod(field);
  return shape;
}

/** Zod raw shape (для `inputSchema` MCP-tool). */
export const shape52941 = buildShape(FIELDS_52941);
export const shape34758 = buildShape(FIELDS_34758);

/** Zod-объекты (для валидации структурного входа). */
export const schema52941 = z.object(shape52941);
export const schema34758 = z.object(shape34758);

export const SHAPES = { '52941': shape52941, '34758': shape34758 } as const;
export const SCHEMAS = { '52941': schema52941, '34758': schema34758 } as const;

/** JSON Schema входа для публикации в `x-ai37.skillsIo[...].input` (карточка агента). */
export function inputJsonSchema(gost: GostId): Record<string, unknown> {
  // Нативный генератор zod 4 (draft-7). `io: 'input'` — учитывать дефолты как опциональные во входе.
  return z.toJSONSchema(SCHEMAS[gost], { target: 'draft-7', io: 'input' }) as Record<
    string,
    unknown
  >;
}

/** Обязательные поля ГОСТ (нет ни статического дефолта, ни авто-производности). */
export function requiredFields(gost: GostId): FieldDescriptor[] {
  return REGISTRY[gost].filter(isRequired);
}

/**
 * Обязательные поля без значения — единый источник для `collectMissing` (диалог) и структурной
 * ошибки валидации (MCP). Значение считается заданным, если оно не `undefined`/`null`.
 */
export function collectMissing(
  gost: GostId,
  values: Record<string, unknown>,
): MissingField[] {
  return requiredFields(gost)
    .filter((f) => values[f.key] === undefined || values[f.key] === null)
    .map((f) => ({
      field: f.key,
      label: f.label,
      ...(f.allowed ? { allowed: f.allowed } : {}),
    }));
}
