/**
 * Контракт варианта подбора (design.md change'а `lift-editor-recommend-block`,
 * Решение 4). Здесь он объявлен локально: в `catalog-schemas` типы заводятся
 * задачей 3.3, а песочница смотрит на блок до контракта. При переносе эти
 * типы удаляются, а блок начинает импортировать
 * `RecommendResourceVariant` из пакета — форма их совпадает до поля.
 */
export interface RecommendVariant {
  /** Ключ списка и селекта. */
  id: string;
  /** «ЩЛЗ ПП-1026ЕН · 3 лифта» — готовая строка, домен считает агент. */
  title: string;
  /** «1000 кг · 1,6 м/с · дверь 1200 мм». */
  subtitle?: string;
  /** «tи 62 с», «комфортность высокая» — по пилюле на заметку. */
  notes?: string[];
  /** `ok` — прошёл ГОСТ, `near` — близ-промах. */
  tone?: 'ok' | 'near';
  apply: {
    /** Сколько лифтовых секций должно получиться. */
    count: number;
    /** Значения полей лифта: имена доменные, блок в них не смотрит. */
    values: Record<string, string | number>;
  };
}

/**
 * Состояния блока (Решение 7). `hidden` в песочнице не показывается — это
 * отсутствие блока, а не его вид.
 */
export type RecommendState = 'loading' | 'shown' | 'empty' | 'stale';

/** Подписи блока: в контракте они приходят пропом, здесь — наполнением страницы. */
export interface RecommendLabels {
  title: string;
  applyLabel: string;
  moreLabel: string;
  loadingLabel: string;
  emptyLabel: string;
  /** Сколько вариантов показывать карточками; остальные уезжают в селект. */
  topCount: number;
}
