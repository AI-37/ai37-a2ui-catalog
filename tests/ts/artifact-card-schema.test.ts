import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {artifactCardPropsSchema, createCatalogArtifact} from '@ai37/a2ui-catalog-schemas';

function readFixture(group: 'valid' | 'invalid', fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', group, fileName), 'utf8'),
  ) as {props: unknown};
}

const ID = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';

describe('ArtifactCard schema', () => {
  it.each(['artifact-card.json', 'artifact-card-minimal.json'])('valid: %s', fileName => {
    expect(artifactCardPropsSchema.safeParse(readFixture('valid', fileName).props).success).toBe(
      true,
    );
  });

  it.each([
    'artifact-card-href-in-props.json',
    'artifact-card-bad-id.json',
    'artifact-card-bad-file-id.json',
  ])('invalid: %s', fileName => {
    expect(artifactCardPropsSchema.safeParse(readFixture('invalid', fileName).props).success).toBe(
      false,
    );
  });

  it('форматы — только docx и md, не больше двух; пустой список валиден', () => {
    const base = {artifactId: ID, name: 'Протокол'};
    expect(artifactCardPropsSchema.safeParse({...base, formats: []}).success).toBe(true);
    expect(artifactCardPropsSchema.safeParse({...base, formats: ['md']}).success).toBe(true);
    expect(artifactCardPropsSchema.safeParse({...base, formats: ['pdf']}).success).toBe(false);
    expect(
      artifactCardPropsSchema.safeParse({...base, formats: ['md', 'docx', 'md']}).success,
    ).toBe(false);
  });

  it('scope — только chat | project; файлов не больше 20', () => {
    const base = {artifactId: ID, name: 'Протокол'};
    expect(artifactCardPropsSchema.safeParse({...base, scope: 'org'}).success).toBe(false);
    const files = Array.from({length: 21}, () => ({id: ID, fileName: 'a.zip'}));
    expect(artifactCardPropsSchema.safeParse({...base, files}).success).toBe(false);
  });

  it('попадает в артефакт каталога', () => {
    expect(Object.keys(createCatalogArtifact().components)).toContain('ArtifactCard');
  });
});
