import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {createCatalogArtifact, liftReportPropsSchema} from '@ai37/a2ui-catalog-schemas';

function readValidFixture(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ) as {component: string; props: Record<string, unknown>};
}

describe('lift-report schema', () => {
  it('validates the figma fixture and exposes the component in the artifact', () => {
    const fixture = readValidFixture('lift-report.json');

    expect(liftReportPropsSchema.safeParse(fixture.props).success).toBe(true);
    expect(Object.keys(createCatalogArtifact().components)).toContain('LiftReport');
  });

  it('rejects unknown keys (strict)', () => {
    const {props} = readValidFixture('lift-report.json');

    expect(liftReportPropsSchema.safeParse({...props, checks: []}).success).toBe(false);

    const suggestions = props.suggestions as {items: Array<Record<string, unknown>>};
    expect(
      liftReportPropsSchema.safeParse({
        ...props,
        suggestions: {
          ...suggestions,
          items: [{...suggestions.items[0], deviationPct: 1}, ...suggestions.items.slice(1)],
        },
      }).success,
    ).toBe(false);
  });

  it('requires verdict and inputs, keeps suggestions and protocol optional', () => {
    const {props} = readValidFixture('lift-report.json');

    expect(liftReportPropsSchema.safeParse({}).success).toBe(false);

    const {inputs: _inputs, ...withoutInputs} = props;
    expect(liftReportPropsSchema.safeParse(withoutInputs).success).toBe(false);

    const {suggestions: _suggestions, protocol: _protocol, ...bare} = props;
    expect(liftReportPropsSchema.safeParse(bare).success).toBe(true);
  });

  it('keeps protocol.downloadUrl optional and rejects it empty', () => {
    const {props} = readValidFixture('lift-report.json');
    const protocol = props.protocol as Record<string, unknown>;
    const {downloadUrl: _downloadUrl, ...withoutUrl} = protocol;

    expect(liftReportPropsSchema.safeParse({...props, protocol: withoutUrl}).success).toBe(true);
    expect(
      liftReportPropsSchema.safeParse({...props, protocol: {...protocol, downloadUrl: ''}}).success,
    ).toBe(false);
  });

  it('accepts a suggestion tone only from the enum', () => {
    const {props} = readValidFixture('lift-report.json');
    const suggestions = props.suggestions as {items: Array<Record<string, unknown>>};

    const withTone = (tone: unknown) => ({
      ...props,
      suggestions: {
        ...suggestions,
        items: [{...suggestions.items[0], tone}, ...suggestions.items.slice(1)],
      },
    });

    expect(liftReportPropsSchema.safeParse(withTone('neutral')).success).toBe(true);
    expect(liftReportPropsSchema.safeParse(withTone('info')).success).toBe(false);
  });
});
