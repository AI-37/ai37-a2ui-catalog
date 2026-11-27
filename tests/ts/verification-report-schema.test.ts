import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  CATALOG_COMPONENT_NAMES,
  createCatalogArtifact,
  verificationReportPropsSchema,
} from '@ai37/a2ui-catalog-schemas';

function readFixture(group: 'valid' | 'invalid', fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', group, fileName), 'utf8'),
  ) as {component: string; props: Record<string, unknown>};
}

const review = () => readFixture('valid', 'verification-report-review.json').props;

describe('verification-report schema', () => {
  it('принимает спорный случай, точечную проверку и вердикт без проверок', () => {
    for (const name of [
      'verification-report-review.json',
      'verification-report-pass.json',
      'verification-report-fail.json',
    ]) {
      expect(verificationReportPropsSchema.safeParse(readFixture('valid', name).props).success).toBe(
        true,
      );
    }
  });

  it('отклоняет невалидные фикстуры', () => {
    for (const name of [
      'verification-report-unknown-status.json',
      'verification-report-empty-details.json',
    ]) {
      expect(
        verificationReportPropsSchema.safeParse(readFixture('invalid', name).props).success,
      ).toBe(false);
    }
  });

  it('strict: лишний ключ в строке не проходит', () => {
    const props = review();
    const checks = [{id: 'egrul', label: 'Статус в ЕГРЮЛ', status: 'pass', expandable: true}];

    expect(verificationReportPropsSchema.safeParse({...props, checks}).success).toBe(false);
  });

  it('вердикт принимает warning, строка — все пять исходов шага', () => {
    const props = review();
    const checks = ['pass', 'fail', 'warning', 'error', 'skipped'].map(status => ({
      id: status,
      label: status,
      status,
    }));

    expect(verificationReportPropsSchema.safeParse({...props, checks}).success).toBe(true);
    expect(
      verificationReportPropsSchema.safeParse({
        ...props,
        verdict: {status: 'error', badge: 'Ошибка', headline: 'ИНН 7203350660'},
      }).success,
    ).toBe(false);
  });

  it('источник без url валиден, пустой url — нет', () => {
    const props = review();
    const base = {id: 'rnp', label: 'РНП', status: 'pass'};

    expect(
      verificationReportPropsSchema.safeParse({
        ...props,
        checks: [{...base, sources: [{label: 'РНП (ЕИС)'}]}],
      }).success,
    ).toBe(true);
    expect(
      verificationReportPropsSchema.safeParse({
        ...props,
        checks: [{...base, sources: [{label: 'РНП (ЕИС)', url: ''}]}],
      }).success,
    ).toBe(false);
  });

  it('компонент зарегистрирован в каталоге', () => {
    expect(CATALOG_COMPONENT_NAMES).toContain('VerificationReport');
    expect(createCatalogArtifact().components).toHaveProperty('VerificationReport');
  });
});
