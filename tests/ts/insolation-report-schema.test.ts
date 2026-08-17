import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {insolationReportPropsSchema} from '@ai37/a2ui-catalog-schemas';

function readFixture(group: 'valid' | 'invalid', fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', group, fileName), 'utf8'),
  ) as {component: string; props: Record<string, unknown>};
}

describe('insolation-report schema', () => {
  it('validates both fixture fillings', () => {
    const pass = readFixture('valid', 'insolation-report-pass.json');
    const fail = readFixture('valid', 'insolation-report-fail.json');

    expect(insolationReportPropsSchema.safeParse(pass.props).success).toBe(true);
    expect(insolationReportPropsSchema.safeParse(fail.props).success).toBe(true);
  });

  it('rejects overlapping timeline segments', () => {
    const fixture = readFixture('invalid', 'insolation-report-overlapping-segments.json');

    expect(insolationReportPropsSchema.safeParse(fixture.props).success).toBe(false);
  });

  it('accepts touching segments — sun and shadow share a boundary', () => {
    const pass = readFixture('valid', 'insolation-report-pass.json');

    expect(insolationReportPropsSchema.safeParse(pass.props).success).toBe(true);
  });

  it('rejects a segment whose end is not after its start', () => {
    const pass = readFixture('valid', 'insolation-report-pass.json');
    const timeline = {
      ...(pass.props.timeline as Record<string, unknown>),
      segments: [{from: 600, to: 600, kind: 'sun'}],
    };

    expect(
      insolationReportPropsSchema.safeParse({...pass.props, timeline}).success,
    ).toBe(false);
  });

  it('rejects unknown keys (strict) and requires verdict with inputs', () => {
    const pass = readFixture('valid', 'insolation-report-pass.json');

    expect(insolationReportPropsSchema.safeParse({...pass.props, chart: {}}).success).toBe(false);
    expect(insolationReportPropsSchema.safeParse({}).success).toBe(false);
  });
});
