import {basicCatalog, type ReactComponentImplementation} from '@a2ui/react/v0_9';
import {Catalog} from '@a2ui/web_core/v0_9';
import {CATALOG_ID} from '@ai37-a2ui/catalog-schemas';
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
