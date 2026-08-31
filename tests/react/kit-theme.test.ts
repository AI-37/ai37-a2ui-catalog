import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  KIT_TOKENS,
  KIT_TOKENS_CSS,
  KIT_POPUP_CSS,
  POPUP_TOKEN_NAMES,
} from '@ai37/a2ui-catalog-react/primitives';

const PRIMITIVES_DIR = path.resolve(process.cwd(), 'packages/catalog-react/src/primitives');

/** Пара темы: `light-dark(<светлое>, <тёмное>)` одним значением токена. */
const PAIR = /^light-dark\((.+),\s*(.+)\)$/;

/** Токен-ссылка тему получает транзитом — своей пары ему не положено. */
const REFERENCE = /^var\(--a2ui-[\w-]+\)$/;

/** Цветное значение: пара, ссылка на другой токен или литерал цвета. */
const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i;

function valueOf(name: string): string {
  const found = KIT_TOKENS.find(([token]) => token === name);
  if (!found) throw new Error(`нет токена ${name}`);
  return found[1];
}

/**
 * Тема набора живёт в двух местах сразу: пара значений в токене и правило,
 * которое выбирает половину. Проверяем оба.
 *
 * Резольвнутое значение (`--a2ui-text-color` === тёмное под
 * `data-a2ui-theme="dark"`) здесь не проверить: jsdom не реализует ни
 * `light-dark()`, ни наследование `color-scheme` — `getComputedStyle` возвращает
 * пару как есть, а `colorScheme` пустой. Настоящая резольвинг-проверка — в
 * браузере, снимки в `openspec/changes/next-dark-theme/preview/`.
 */
describe('тема набора примитивов', () => {
  it('цветной токен несёт обе половины одним значением', () => {
    const colored = KIT_TOKENS.filter(([, value]) => COLOR_LITERAL.test(value));

    expect(colored.length).toBeGreaterThan(0);
    for (const [name, value] of colored) {
      const halves = PAIR.exec(value);
      expect(halves, `${name} объявлен без тёмной половины: ${value}`).not.toBeNull();
      expect(halves?.[1].trim(), `${name}: половины совпадают`).not.toBe(halves?.[2].trim());
    }
  });

  it('токен-ссылка своей пары не заводит', () => {
    const referenced = KIT_TOKENS.filter(([, value]) => value.startsWith('var('));

    expect(referenced.length).toBeGreaterThan(0);
    for (const [name, value] of referenced) {
      expect(value, `${name} должен оставаться ссылкой`).toMatch(REFERENCE);
    }
  });

  it('второго массива значений темы не существует', () => {
    const tokensFile = readFileSync(path.join(PRIMITIVES_DIR, 'kit-tokens.ts'), 'utf8');

    expect(tokensFile).not.toMatch(/KIT_TOKENS_DARK|KIT_TOKENS_LIGHT/);
    // Второй блок правил, переобъявляющий те же имена под селектором темы.
    expect(KIT_TOKENS_CSS).not.toMatch(/data-a2ui-theme[^{]*\{[^}]*--a2ui-/);
  });

  it('тему выбирает хост: атрибут отображается в color-scheme нулевой специфичностью', () => {
    expect(KIT_TOKENS_CSS).toContain(":where([data-a2ui-theme='light']) { color-scheme: light; }");
    expect(KIT_TOKENS_CSS).toContain(":where([data-a2ui-theme='dark']) { color-scheme: dark; }");
  });

  it('.a2ui-kit не объявляет color-scheme', () => {
    const kitBlock = KIT_TOKENS_CSS.slice(KIT_TOKENS_CSS.indexOf('.a2ui-kit {'));

    expect(kitBlock).not.toContain('color-scheme');
  });

  it('литералов цвета в примитивах не осталось', () => {
    const offenders: string[] = [];

    for (const file of readdirSync(PRIMITIVES_DIR)) {
      if (file === 'kit-tokens.ts') continue;

      const source = readFileSync(path.join(PRIMITIVES_DIR, file), 'utf8');
      for (const line of source.split('\n')) {
        if (/#[0-9a-f]{3}\b|#[0-9a-f]{6}\b|rgba?\(|hsla?\(/i.test(line)) {
          offenders.push(`${file}: ${line.trim()}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('тень попапа — токен парой, и попап её объявляет', () => {
    expect(valueOf('--a2ui-shadow-popup')).toMatch(PAIR);
    expect(KIT_POPUP_CSS).toContain('box-shadow: 0 8px 24px var(--a2ui-shadow-popup);');
    expect(POPUP_TOKEN_NAMES).toContain('--a2ui-shadow-popup');
  });

  it('POPUP_TOKEN_NAMES — подмножество имён KIT_TOKENS', () => {
    const names = KIT_TOKENS.map(([name]) => name);

    expect(POPUP_TOKEN_NAMES.filter(name => !names.includes(name))).toEqual([]);
  });
});
