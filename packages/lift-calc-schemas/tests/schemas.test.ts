import { describe, it, expect } from 'vitest';
import {
  schema52941,
  schema34758,
  inputJsonSchema,
  collectMissing,
  requiredFields,
} from '../src';

describe('lift-calc-schemas: реестр → zod/JSON Schema/missing', () => {
  it('52941: обязательны только N и A', () => {
    expect(requiredFields('52941').map((f) => f.key)).toEqual(['N', 'A']);
  });

  it('52941: дефолты и авто-поля не требуются, дефолты проставляются', () => {
    const parsed = schema52941.parse({ N: 10, A: 200 });
    expect(parsed.Vn).toBe(1.0);
    expect(parsed.dt).toBe(1);
    expect(parsed.Q).toBe(1000);
    expect(parsed.H0).toBe(0);
    // h/t123 — auto (optional), в схеме отсутствуют до автоподстановки в агенте
    expect(parsed.h).toBeUndefined();
    expect(parsed.t123).toBeUndefined();
  });

  it('52941: collectMissing ловит N/A и пусто при полном вводе', () => {
    expect(collectMissing('52941', {}).map((m) => m.field)).toEqual(['N', 'A']);
    expect(collectMissing('52941', { N: 10, A: 200 })).toEqual([]);
  });

  it('34758: обязательны buildingType, N1, A, Nl, Vn, doorWidth', () => {
    expect(requiredFields('34758').map((f) => f.key)).toEqual([
      'buildingType',
      'N1',
      'A',
      'Nl',
      'Vn',
      'doorWidth',
    ]);
  });

  it('34758: недопустимая Q отвергается, допустимая/дефолт принимается', () => {
    expect(() =>
      schema34758.parse({ buildingType: 'office', N1: 10, A: 300, Nl: 2, Vn: 1.6, doorWidth: 1100, Q: 999 }),
    ).toThrow();
    const parsed = schema34758.parse({ buildingType: 'office', N1: 10, A: 300, Nl: 2, Vn: 1.6, doorWidth: 1100 });
    expect(parsed.Q).toBe(1000);
    expect(parsed.tOst).toBeUndefined(); // auto
  });

  it('JSON Schema несёт properties и enum допустимых значений', () => {
    const js = inputJsonSchema('34758') as {
      properties: Record<string, { enum?: unknown[] }>;
    };
    expect(js.properties.doorWidth).toBeTruthy();
    expect(js.properties.buildingType?.enum).toEqual(['residential', 'hotel', 'office']);
  });

  it('collectMissing отдаёт allowed для enum-полей', () => {
    const missing = collectMissing('34758', { N1: 10, A: 300, Nl: 2, Vn: 1.6 });
    const doorWidth = missing.find((m) => m.field === 'doorWidth');
    expect(doorWidth?.allowed).toEqual([800, 900, 1000, 1100, 1200]);
  });
});
