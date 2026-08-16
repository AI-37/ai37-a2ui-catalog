import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {thermalReportPropsSchema} from '@ai37/a2ui-catalog-schemas';

function readValidFixture(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ) as {component: string; props: unknown};
}

describe('thermal-report schema', () => {
  it('validates both fixture fillings', () => {
    const single = readValidFixture('thermal-report-single.json');
    const multi = readValidFixture('thermal-report-multi.json');

    expect(thermalReportPropsSchema.safeParse(single.props).success).toBe(true);
    expect(thermalReportPropsSchema.safeParse(multi.props).success).toBe(true);
  });

  it('rejects unknown keys (strict)', () => {
    const single = readValidFixture('thermal-report-single.json');
    const withExtra = {...(single.props as Record<string, unknown>), downloadUrl: 'x'};

    expect(thermalReportPropsSchema.safeParse(withExtra).success).toBe(false);
  });

  it('requires verdict and inputs', () => {
    expect(thermalReportPropsSchema.safeParse({}).success).toBe(false);

    const single = readValidFixture('thermal-report-single.json');
    const {inputs: _inputs, ...withoutInputs} = single.props as Record<string, unknown>;
    expect(thermalReportPropsSchema.safeParse(withoutInputs).success).toBe(false);
  });
});
