import {CONSTRUCTIONS_EDITOR_CSS} from '../../../../packages/catalog-react/src/renderers/constructions-editor-styles';
import {THERMAL_REPORT_CSS} from '../../../../packages/catalog-react/src/renderers/thermal-report-styles';
import {KEO_REPORT_CSS} from '../../../../packages/catalog-react/src/renderers/keo-report-styles';
import {LIFT_REPORT_CSS} from '../../../../packages/catalog-react/src/renderers/lift-report-styles';
import {INSOLATION_REPORT_CSS} from '../../../../packages/catalog-react/src/renderers/insolation-report-styles';
import {KEO_EDITOR_CSS} from '../../../../packages/catalog-react/src/renderers/keo-editor-styles';
import {LIFT_EDITOR_CSS} from '../../../../packages/catalog-react/src/renderers/lift-editor-styles';
import {INSOLATION_EDITOR_CSS} from '../../../../packages/catalog-react/src/renderers/insolation-editor-styles';
import {tokens} from '../../../../packages/catalog-react/src/renderers/tokens';
import type {ButtonFamily} from './button-inventory.types';

/** Инлайн-стиль submit'а FormCard/ChoiceCard — скопирован из рендереров as is. */
const cardSubmitStyle = {
  justifySelf: 'start',
  padding: '10px 18px',
  borderRadius: 12,
  border: 'none',
  background: tokens.accent,
  color: tokens.accentContrast,
  fontWeight: 600,
  cursor: 'pointer',
} as const;

/**
 * Ревизия кнопок каталога: всё, что сегодня кликается, одним списком.
 * Порядок — от самого нагруженного семейства к копиям, чтобы дубли читались
 * подряд. Метрики выписаны из CSS дословно, без округления, — на них
 * держится вывод «это одна кнопка» / «это разные кнопки».
 */
export const BUTTON_INVENTORY: ButtonFamily[] = [
  {
    title: 'ConstructionsEditor · a2ui-ce-btn',
    root: 'a2ui-ce',
    css: CONSTRUCTIONS_EDITOR_CSS,
    source: 'renderers/constructions-editor-styles.ts',
    samples: [
      {
        className: 'a2ui-ce-btn',
        label: 'Отмена',
        usedIn: 'layer-row, card-header, passport, «Назад»',
        metrics: '8/14 · r9 · 13px · outline',
      },
      {
        className: 'a2ui-ce-btn a2ui-ce-btn--primary',
        label: 'Рассчитать',
        usedIn: 'футер редактора',
        metrics: '10/20 · r9 · 13px · solid',
      },
      {
        className: 'a2ui-ce-btn a2ui-ce-btn--commit',
        label: 'Применить',
        usedIn: 'layer-row, card-header, passport',
        metrics: '8/14 · r9 · 13px · solid',
      },
      {
        className: 'a2ui-ce-btn a2ui-ce-btn--dashed',
        label: '+ Добавить конструкцию',
        usedIn: 'список конструкций',
        metrics: '8/14 · r9 · dashed',
      },
      {
        className: 'a2ui-ce-btn a2ui-ce-btn--add-layer',
        label: '+ Добавить слой',
        usedIn: 'карточка конструкции',
        metrics: '6/12 · r9 · dashed',
      },
      {
        className: 'a2ui-ce-btn a2ui-ce-btn--edit',
        label: 'Изменить',
        usedIn: 'шапка карточки, паспорт',
        metrics: '4/10 · 12px · muted',
      },
      {
        className: 'a2ui-ce-btn a2ui-ce-btn--danger',
        label: 'Удалить слой',
        usedIn: 'форма слоя',
        metrics: '6/4 · 12.5px · danger',
      },
      {
        className: 'a2ui-ce-link',
        label: 'Свернуть',
        usedIn: 'блок «Условия»',
        metrics: '0 · 12.5px/15 · accent',
      },
    ],
  },
  {
    title: 'ThermalReport · a2ui-tr-btn',
    root: 'a2ui-tr',
    css: THERMAL_REPORT_CSS,
    source: 'renderers/thermal-report-styles.ts',
    samples: [
      {
        className: 'a2ui-tr-btn',
        label: 'Изменить и пересчитать',
        usedIn: 'исходные данные',
        metrics: '8/14 · r9 · 13px · outline',
      },
      {
        className: 'a2ui-tr-btn a2ui-tr-btn--solid',
        label: 'Пересчитать',
        usedIn: 'действия отчёта',
        metrics: '8/14 · r9 · 13px · solid',
      },
      {
        className: 'a2ui-tr-btn a2ui-tr-btn--link',
        label: 'Скачать',
        usedIn: 'протокол',
        metrics: '4/0 · 13px · accent',
      },
    ],
  },
  {
    title: 'KeoReport · a2ui-kr-btn',
    root: 'a2ui-kr',
    css: KEO_REPORT_CSS,
    source: 'renderers/keo-report-styles.ts',
    duplicateOf: 'a2ui-tr-btn — один-в-один, отличается только префикс токенов',
    samples: [
      {className: 'a2ui-kr-btn', label: 'Изменить', usedIn: 'исходные данные', metrics: '8/14 · r9 · 13px · outline'},
      {className: 'a2ui-kr-btn a2ui-kr-btn--solid', label: 'Пересчитать', usedIn: 'действия', metrics: '8/14 · r9 · solid'},
      {className: 'a2ui-kr-btn a2ui-kr-btn--link', label: 'Скачать', usedIn: 'протокол', metrics: '4/0 · accent'},
    ],
  },
  {
    title: 'LiftReport · a2ui-lr-btn',
    root: 'a2ui-lr',
    css: LIFT_REPORT_CSS,
    source: 'renderers/lift-report-styles.ts',
    duplicateOf: 'a2ui-tr-btn — один-в-один (+ text-decoration: none)',
    samples: [
      {className: 'a2ui-lr-btn', label: 'Изменить', usedIn: 'исходные данные', metrics: '8/14 · r9 · 13px · outline'},
      {className: 'a2ui-lr-btn a2ui-lr-btn--solid', label: 'Пересчитать', usedIn: 'действия', metrics: '8/14 · r9 · solid'},
      {className: 'a2ui-lr-btn a2ui-lr-btn--link', label: 'Скачать', usedIn: 'протокол', metrics: '4/0 · accent'},
    ],
  },
  {
    title: 'InsolationReport · a2ui-ir-btn',
    root: 'a2ui-ir',
    css: INSOLATION_REPORT_CSS,
    source: 'renderers/insolation-report-styles.ts',
    duplicateOf: 'a2ui-tr-btn — один-в-один',
    samples: [
      {className: 'a2ui-ir-btn', label: 'Изменить', usedIn: 'исходные данные', metrics: '8/14 · r9 · 13px · outline'},
      {className: 'a2ui-ir-btn a2ui-ir-btn--solid', label: 'Пересчитать', usedIn: 'действия', metrics: '8/14 · r9 · solid'},
      {className: 'a2ui-ir-btn a2ui-ir-btn--link', label: 'Скачать', usedIn: 'протокол', metrics: '4/0 · accent'},
    ],
  },
  {
    title: 'LiftEditor · a2ui-le-submit / -link',
    root: 'a2ui-le',
    css: LIFT_EDITOR_CSS,
    source: 'renderers/lift-editor-styles.ts',
    samples: [
      {
        className: 'a2ui-le-submit',
        label: 'Далее',
        usedIn: 'футер редактора',
        metrics: '9/18 · r8 · 14px · weight 600 · solid',
      },
      {className: 'a2ui-le-link', label: 'Показать', usedIn: 'строка-сводка секции', metrics: '0 · 13px · accent'},
      {className: 'a2ui-le-link a2ui-le-link--danger', label: 'Удалить лифт', usedIn: 'секция лифта', metrics: '0 · 13px · danger'},
    ],
  },
  {
    title: 'KeoEditor · a2ui-ke-submit / -link',
    root: 'a2ui-ke',
    css: KEO_EDITOR_CSS,
    source: 'renderers/keo-editor-styles.ts',
    duplicateOf: 'a2ui-le-submit / a2ui-le-link — один-в-один',
    samples: [
      {className: 'a2ui-ke-submit', label: 'Рассчитать', usedIn: 'футер', metrics: '9/18 · r8 · weight 600 · solid'},
      {className: 'a2ui-ke-link', label: 'Показать', usedIn: 'секция', metrics: '0 · 13px · accent'},
      {className: 'a2ui-ke-link a2ui-ke-link--danger', label: 'Удалить помещение', usedIn: 'секция помещения', metrics: '0 · 13px · danger'},
    ],
  },
  {
    title: 'InsolationEditor · a2ui-ie-submit / -link',
    root: 'a2ui-ie',
    css: INSOLATION_EDITOR_CSS,
    source: 'renderers/insolation-editor-styles.ts',
    duplicateOf: 'a2ui-le-submit / a2ui-le-link — один-в-один',
    samples: [
      {className: 'a2ui-ie-submit', label: 'Рассчитать', usedIn: 'футер', metrics: '9/18 · r8 · weight 600 · solid'},
      {className: 'a2ui-ie-link', label: 'Показать', usedIn: 'секция', metrics: '0 · 13px · accent'},
      {className: 'a2ui-ie-link a2ui-ie-link--danger', label: 'Удалить здание', usedIn: 'список зданий', metrics: '0 · 13px · danger'},
    ],
  },
  {
    title: 'FormCard / ChoiceCard · инлайн-стиль без класса',
    root: null,
    css: null,
    source: 'renderers/form-card.tsx, renderers/choice-card.tsx',
    duplicateOf: 'две копии одного литерала стилей в двух файлах',
    samples: [
      {
        className: null,
        style: cardSubmitStyle,
        label: 'Отправить',
        usedIn: 'submit FormCard',
        metrics: '10/18 · r12 · weight 600 · --a2ui-color-accent',
      },
      {
        className: null,
        style: cardSubmitStyle,
        label: 'Выбрать',
        usedIn: 'submit ChoiceCard',
        metrics: '10/18 · r12 · weight 600 · --a2ui-color-accent',
      },
    ],
  },
];
