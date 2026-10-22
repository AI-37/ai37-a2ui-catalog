import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  CATALOG_COMPONENT_NAMES,
  CHAT_ATTACHMENTS_ROUTE,
  attachmentChoiceCardPropsSchema,
} from '@ai37/a2ui-catalog-schemas';

function readFixture(group: 'valid' | 'invalid', fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', group, fileName), 'utf8'),
  ) as {component: string; props: Record<string, unknown>};
}

describe('attachment-choice-card schema', () => {
  it('принимает карточку подписи, минимальную и без skip', () => {
    for (const name of [
      'attachment-choice-card-signature.json',
      'attachment-choice-card-minimal.json',
      'attachment-choice-card-attach-only.json',
    ]) {
      expect(attachmentChoiceCardPropsSchema.safeParse(readFixture('valid', name).props).success).toBe(
        true,
      );
    }
  });

  it('отклоняет карточку без contextId, без accept и с лишним ключом', () => {
    for (const name of [
      'attachment-choice-card-no-context.json',
      'attachment-choice-card-attach-no-accept.json',
      'attachment-choice-card-extra-key.json',
    ]) {
      expect(
        attachmentChoiceCardPropsSchema.safeParse(readFixture('invalid', name).props).success,
      ).toBe(false);
    }
  });

  it('зарегистрирована в каталоге, ручка загрузки — та же, что у композера', () => {
    expect(CATALOG_COMPONENT_NAMES).toContain('AttachmentChoiceCard');
    expect(CHAT_ATTACHMENTS_ROUTE).toBe('/api/chat-attachments');
  });

  it('skip необязателен, но если есть — с label', () => {
    const props = readFixture('valid', 'attachment-choice-card-attach-only.json').props;
    expect(
      attachmentChoiceCardPropsSchema.safeParse({...props, skip: {value: 'skip'}}).success,
    ).toBe(false);
  });
});
