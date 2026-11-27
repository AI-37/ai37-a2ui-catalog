import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {keoDrawingsSchema, keoReportPropsSchema} from '@ai37/a2ui-catalog-schemas';

function readValidFixture(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ) as {component: string; props: Record<string, unknown>};
}

function drawings() {
  return structuredClone(
    readValidFixture('keo-report-drawings.json').props.drawings,
  ) as Record<string, any>;
}

describe('keo-drawings schema', () => {
  it('validates both fixture fillings', () => {
    const visible = readValidFixture('keo-report-drawings.json');
    const blocked = readValidFixture('keo-report-drawings-blocked.json');

    expect(keoReportPropsSchema.safeParse(visible.props).success).toBe(true);
    expect(keoReportPropsSchema.safeParse(blocked.props).success).toBe(true);
  });

  it('оставляет отчёт валидным без чертежей', () => {
    const {drawings: _drawings, ...withoutDrawings} = readValidFixture(
      'keo-report-drawings.json',
    ).props;

    expect(keoReportPropsSchema.safeParse(withoutDrawings).success).toBe(true);
  });

  it('отвергает сырую разметку вместо модели', () => {
    const props = readValidFixture('keo-report-drawings.json').props;

    expect(
      keoReportPropsSchema.safeParse({...props, drawings: '<svg viewBox="0 0 10 10" />'}).success,
    ).toBe(false);
    expect(keoDrawingsSchema.safeParse({section: '<g/>', plan: '<g/>'}).success).toBe(false);
  });

  it('отвергает угол вне диапазона градусов', () => {
    // Схема ловит единицы диапазоном: 100° углом возвышения не бывает, а
    // радианы отличить от градусов числом нельзя — потому единицы и
    // зафиксированы контрактом, а не догадкой рендерера.
    const model = drawings();
    model.section.alphaDeg = 100;

    expect(keoDrawingsSchema.safeParse(model).success).toBe(false);
  });

  it('отвергает пустой веер графика II', () => {
    const model = drawings();
    model.plan.fanRayAnglesDeg = [];

    expect(keoDrawingsSchema.safeParse(model).success).toBe(false);
  });

  it('отвергает веер длиннее половины графика', () => {
    const model = drawings();
    model.plan.fanRayAnglesDeg = Array.from({length: 50}, (_, index) => index + 0.5);

    expect(keoDrawingsSchema.safeParse(model).success).toBe(false);
  });

  it('отвергает лишние ключи и готовые строки в модели', () => {
    const model = drawings();
    model.section.svg = '<svg/>';

    expect(keoDrawingsSchema.safeParse(model).success).toBe(false);

    const strings = drawings();
    strings.section.roomDepth = '5,4 м';

    expect(keoDrawingsSchema.safeParse(strings).success).toBe(false);
  });

  it('требует обе проекции', () => {
    const model = drawings();
    delete model.plan;

    expect(keoDrawingsSchema.safeParse(model).success).toBe(false);
  });
});
