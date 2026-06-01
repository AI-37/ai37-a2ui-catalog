export const CATALOG_SLUG = 'ai37-a2ui';
export const CATALOG_VERSION = 'v1';
export const CATALOG_BASE_URL = `https://a2ui-schemas.dev.ai37.ru/a2ui/catalogs/${CATALOG_SLUG}/${CATALOG_VERSION}`;
export const CATALOG_ID = `${CATALOG_BASE_URL}/catalog.json`;
export const CATALOG_TITLE = 'AI37 Custom A2UI Catalog';
export const CATALOG_COMPONENT_NAMES = ['SimpleTable', 'FlexTable', 'LatexFormula'] as const;

export type CatalogComponentName = (typeof CATALOG_COMPONENT_NAMES)[number];
