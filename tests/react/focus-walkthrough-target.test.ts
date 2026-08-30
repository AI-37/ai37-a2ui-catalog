import {describe, expect, it} from 'vitest';
import {focusWalkthroughTarget} from '../../packages/catalog-react/src/renderers/focus-walkthrough-target';

/**
 * Контракт хелпера прохода проверяется здесь поштучно, а не через экран:
 * поведенческие тесты редакторов видят только «каретка внутри раскрытой
 * секции», и отсев скрытых узлов в них молча выпадает — набор полей боевой
 * фикстуры такую ветку просто не создаёт.
 */
function section(panelMarkup: string, {hidden = false} = {}) {
  const host = document.createElement('div');
  host.innerHTML = `
    <div class="card">
      <button id="head" aria-controls="panel">Заголовок</button>
      <div id="panel"${hidden ? ' hidden' : ''}>${panelMarkup}</div>
    </div>
  `;
  document.body.append(host);

  return host.querySelector<HTMLElement>('.card')!;
}

/** Каждый тест начинает с чистого документа: фокус — состояние глобальное. */
afterEach(() => {
  document.body.innerHTML = '';
});

describe('focusWalkthroughTarget', () => {
  it('берёт первый фокусируемый контрол панели', () => {
    const card = section('<input id="first"><input id="second">');

    focusWalkthroughTarget(card);

    expect(document.activeElement?.id).toBe('first');
  });

  it('пропускает служебный input Base UI — он стоит в разметке раньше видимого', () => {
    // Так выглядит числовое поле: скрытый input формы идёт ПЕРВЫМ, и без
    // отсева каретка встала бы на него — фокус по нему браузер выполняет
    // молча и без результата.
    const card = section(
      '<input id="hidden-value" tabindex="-1" aria-hidden="true"><input id="visible">',
    );

    focusWalkthroughTarget(card);

    expect(document.activeElement?.id).toBe('visible');
  });

  it('пропускает выключенный контрол', () => {
    const card = section('<input id="off" disabled><input id="on">');

    focusWalkthroughTarget(card);

    expect(document.activeElement?.id).toBe('on');
  });

  it('пропускает контролы свёрнутого блока внутри цели', () => {
    // `SummaryCollapsible` держит свою панель `keepMounted`: её поля в DOM
    // есть, но они спрятаны.
    const card = section(
      '<div hidden><input id="inside-collapsed"></div><input id="outside">',
    );

    focusWalkthroughTarget(card);

    expect(document.activeElement?.id).toBe('outside');
  });

  it('без контролов уводит каретку на заголовок цели', () => {
    const card = section('<p>только сводка</p>');

    focusWalkthroughTarget(card);

    expect(document.activeElement?.id).toBe('head');
  });

  it('нераскрытая панель — тоже заголовок: скрытому фокус не поставить', () => {
    const card = section('<input id="first">', {hidden: true});

    focusWalkthroughTarget(card);

    expect(document.activeElement?.id).toBe('head');
  });

  it('без цели не трогает каретку', () => {
    const card = section('<input id="first">');
    const outside = document.createElement('input');
    document.body.append(outside);
    outside.focus();

    focusWalkthroughTarget(null);

    expect(document.activeElement).toBe(outside);
    expect(card).toBeTruthy();
  });
});
