import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {keoReportPropsSchema} from '@ai37/a2ui-catalog-schemas';

function readValidFixture(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ) as {component: string; props: Record<string, unknown>};
}

describe('keo-report schema', () => {
  it('validates both fixture fillings', () => {
    const fail = readValidFixture('keo-report-fail.json');
    const pass = readValidFixture('keo-report-pass.json');

    expect(keoReportPropsSchema.safeParse(fail.props).success).toBe(true);
    expect(keoReportPropsSchema.safeParse(pass.props).success).toBe(true);
  });

  it('rejects unknown keys (strict)', () => {
    const fail = readValidFixture('keo-report-fail.json');

    expect(keoReportPropsSchema.safeParse({...fail.props, downloadUrl: 'x'}).success).toBe(false);
  });

  it('requires verdict and inputs', () => {
    expect(keoReportPropsSchema.safeParse({}).success).toBe(false);

    const fail = readValidFixture('keo-report-fail.json');
    const {inputs: _inputs, ...withoutInputs} = fail.props;
    expect(keoReportPropsSchema.safeParse(withoutInputs).success).toBe(false);
  });

  it('rejects an unknown recommendation tone', () => {
    const fail = readValidFixture('keo-report-fail.json');
    const recommendations = [
      {title: 'Окно 1,8 × 1,5 м', detail: 'КЕО 0,52 %', tone: 'warning'},
    ];

    expect(
      keoReportPropsSchema.safeParse({...fail.props, recommendations}).success,
    ).toBe(false);
  });
});
