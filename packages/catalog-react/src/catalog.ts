import {basicCatalog, type ReactComponentImplementation} from '@a2ui/react/v0_9';
import {Catalog} from '@a2ui/web_core/v0_9';
import {CATALOG_ID, A2UI_BASE_CATALOG_ID} from '@ai37/a2ui-catalog-schemas';

// Guard дрейфа версий @a2ui: серверная константа A2UI_BASE_CATALOG_ID (ею агент объявляет/негоциирует
// базовый каталог) должна совпадать с рантайм-id установленного basicCatalog. Иначе base-негоциация и
// деградация молча сломаются (surface с base-id не сматчится). Ловим в точке композиции — fail-fast.
if (basicCatalog.id !== A2UI_BASE_CATALOG_ID) {
  throw new Error(
    `A2UI base catalog id drift: runtime basicCatalog.id="${basicCatalog.id}" != ` +
      `A2UI_BASE_CATALOG_ID="${A2UI_BASE_CATALOG_ID}". Синхронизируйте constants.ts с версией @a2ui.`,
  );
}
import {SimpleTable} from './renderers/simple-table';
import {FlexTable} from './renderers/flex-table';
import {LatexFormula} from './renderers/latex-formula';
import {ChoiceCard} from './renderers/choice-card';
import {FormCard} from './renderers/form-card';
import {ConstructionsEditor} from './renderers/constructions-editor';
import {ConstructionsEditorNext} from './renderers/constructions-editor-next';
import {LiftEditor} from './renderers/lift-editor';
import {LiftEditorNext} from './renderers/lift-editor-next';
import {ThermalReport} from './renderers/thermal-report';
import {ThermalReportNext} from './renderers/thermal-report-next';
import {KeoEditor} from './renderers/keo-editor';
import {KeoEditorNext} from './renderers/keo-editor-next';
import {KeoReport} from './renderers/keo-report';
import {KeoReportNext} from './renderers/keo-report-next';
import {InsolationEditor} from './renderers/insolation-editor';
import {InsolationReport} from './renderers/insolation-report';
import {LiftReport} from './renderers/lift-report';
import {LiftReportNext} from './renderers/lift-report-next';
import {ArtifactCard} from './renderers/artifact-card';
import {withReadOnlyGate} from './renderers/surface-read-only';

/**
 * Компоненты ввода: на прошлой поверхности (`SurfaceReadOnlyProvider`) их поддерево
 * глушится целиком. Отчёты, таблицы и карточка артефакта сюда не входят — у них
 * скачивание, ссылки и раскрытие остаются рабочими, а кнопки действий агенту
 * прячутся сами (`useSurfaceReadOnly`).
 */
const BASIC_INPUT_COMPONENTS = new Set([
  'Button',
  'TextField',
  'CheckBox',
  'ChoicePicker',
  'Slider',
  'DateTimeInput',
]);

const basicComponents = [...basicCatalog.components.values()].map(component =>
  BASIC_INPUT_COMPONENTS.has(component.name) ? withReadOnlyGate(component) : component,
);

const customComponents: ReactComponentImplementation[] = [
  SimpleTable,
  FlexTable,
  LatexFormula,
  withReadOnlyGate(ChoiceCard),
  withReadOnlyGate(FormCard),
  withReadOnlyGate(ConstructionsEditor),
  // Рядом со старым, а не вместо: одно наполнение рендерится обоими, пока
  // сравнение «было / стало» не закончено (change constructions-editor-next).
  withReadOnlyGate(ConstructionsEditorNext),
  withReadOnlyGate(LiftEditor),
  // Рядом со старым, а не вместо: одно наполнение рендерится обоими, пока
  // сравнение «было / стало» не закончено (change lift-editor-next).
  withReadOnlyGate(LiftEditorNext),
  ThermalReport,
  // Рядом со старым, а не вместо: одно наполнение рендерится обоими, пока
  // сравнение «было / стало» не закончено (change reports-next).
  ThermalReportNext,
  withReadOnlyGate(KeoEditor),
  // Рядом со старым, а не вместо: одно наполнение рендерится обоими, пока
  // сравнение «было / стало» не закончено (change keo-editor-next).
  withReadOnlyGate(KeoEditorNext),
  KeoReport,
  // Рядом со старым — тот же набор примитивов, что у ThermalReportNext и
  // LiftReportNext (change keo-report-next).
  KeoReportNext,
  withReadOnlyGate(InsolationEditor),
  InsolationReport,
  LiftReport,
  // Рядом со старым — тот же набор примитивов, что у ThermalReportNext.
  LiftReportNext,
  // Карточка артефакта агента: ссылки на выгрузки и «Сохранить в проект» через хост.
  ArtifactCard,
];

export const ai37Catalog = new Catalog<ReactComponentImplementation>(
  CATALOG_ID,
  [...basicComponents, ...customComponents],
  [...basicCatalog.functions.values()],
  basicCatalog.themeSchema,
);

export const ai37Catalogs = [ai37Catalog];
