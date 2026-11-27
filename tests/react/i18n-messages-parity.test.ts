import {describe, expect, it} from 'vitest';
import {A2UI_BUILTIN_LANGUAGES, A2UI_MESSAGES, RU_MESSAGES} from '@ai37/a2ui-catalog-react';

/**
 * Паритет встроенных словарей с русским (план docs#589 §3.14): нет ключа хотя
 * бы в одном языке — тест падает. Типы ловят то же при сборке, но словарь хоста
 * и будущие языки приходят мимо типов — правило держит и этот тест.
 */
type Tree = {readonly [key: string]: unknown};

function leaves(tree: Tree, prefix = ''): Map<string, unknown> {
  const out = new Map<string, unknown>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (typeof value === 'object' && value !== null && !isPlural(value)) {
      for (const [leaf, leafValue] of leaves(value as Tree, path)) out.set(leaf, leafValue);
    } else {
      out.set(path, value);
    }
  }
  return out;
}

function isPlural(value: object): boolean {
  return 'other' in value;
}

function placeholders(value: unknown): string[] {
  const texts = typeof value === 'string' ? [value] : Object.values(value as Tree).map(String);
  const names = texts.flatMap(text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]!));
  return [...new Set(names)].sort();
}

const RU = leaves(RU_MESSAGES);

describe('встроенные словари подписей', () => {
  it('шесть языков, русский — источник', () => {
    expect([...A2UI_BUILTIN_LANGUAGES]).toEqual(['ru', 'en', 'es', 'de', 'fr', 'pt']);
    expect(A2UI_MESSAGES.ru).toBe(RU_MESSAGES);
  });

  it.each(A2UI_BUILTIN_LANGUAGES.filter(language => language !== 'ru'))(
    '%s: те же ключи, что у русского',
    language => {
      const own = leaves(A2UI_MESSAGES[language]);
      expect([...own.keys()].sort()).toEqual([...RU.keys()].sort());
    },
  );

  it.each(A2UI_BUILTIN_LANGUAGES)('%s: строки не пустые, у форм по числу one и other', language => {
    for (const [path, value] of leaves(A2UI_MESSAGES[language])) {
      if (typeof value === 'string') {
        expect(value.trim(), path).not.toBe('');
      } else {
        expect(value, path).toHaveProperty('one');
        expect(value, path).toHaveProperty('other');
      }
    }
  });

  it.each(A2UI_BUILTIN_LANGUAGES)('%s: подстановки те же, что у русского', language => {
    for (const [path, value] of leaves(A2UI_MESSAGES[language])) {
      expect(placeholders(value), path).toEqual(placeholders(RU.get(path)));
    }
  });

  it.each(A2UI_BUILTIN_LANGUAGES)('%s: обозначения норм не переведены', language => {
    const c = A2UI_MESSAGES[language].constructions;
    expect(c.gsop).toContain('ГСОП');
    expect(c.summaryClimate).toContain('СП 131');
    expect(c.passportField).toContain('Rпр');
    expect(c.summaryTv).toContain('tв');
    expect(A2UI_MESSAGES[language].keo.skyBlocked).toContain('РТ');
  });
});
