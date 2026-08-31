/**
 * Куда встаёт каретка на шаге прохода: первый фокусируемый контрол раскрытой
 * панели цели, а контролов нет — заголовок самой цели (Решение 2 design
 * `next-walkthrough-focus`).
 *
 * Панель ищется по `aria-controls` заголовка, а не по классу: примитив
 * `SectionItem` объявляет эту связь явно и держит её в обоих состояниях.
 *
 * Спрятанное пропускается, и это не перестраховка: панели живут `keepMounted`,
 * внутри цели стоят свои свёрнутые блоки (`SummaryCollapsible`), а Base UI
 * держит у списков служебный `input` с `tabindex="-1"` и `aria-hidden`. Фокус
 * на таком узле браузер выполняет молча и без результата — то есть ровно тот
 * дефект, который чинится.
 */
export function focusWalkthroughTarget(section: HTMLElement | null): void {
  if (section === null) return;

  const trigger = section.querySelector<HTMLElement>('[aria-controls]');
  const panelId = trigger?.getAttribute('aria-controls') ?? null;
  const panel = panelId === null ? null : section.ownerDocument.getElementById(panelId);
  const control = panel === null || panel.hidden ? undefined : firstControl(panel);

  (control ?? trigger)?.focus();
}

/** Кандидаты в каретку: всё, что вообще умеет фокус, — отсев ниже. */
const FOCUSABLE = 'input, select, textarea, button, a[href], [tabindex]';

function firstControl(panel: HTMLElement): HTMLElement | undefined {
  return [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].find(
    node =>
      !node.hasAttribute('disabled') &&
      node.getAttribute('tabindex') !== '-1' &&
      node.getAttribute('aria-hidden') !== 'true' &&
      node.closest('[hidden]') === null,
  );
}
