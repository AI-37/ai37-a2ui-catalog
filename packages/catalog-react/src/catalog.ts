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

const customComponents: ReactComponentImplementation[] = [
  SimpleTable,
  FlexTable,
  LatexFormula,
  ChoiceCard,
  FormCard,
];

export const ai37Catalog = new Catalog<ReactComponentImplementation>(
  CATALOG_ID,
  [...basicCatalog.components.values(), ...customComponents],
  [...basicCatalog.functions.values()],
  basicCatalog.themeSchema,
);

export const ai37Catalogs = [ai37Catalog];
