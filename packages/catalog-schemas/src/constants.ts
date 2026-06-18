export const CATALOG_SLUG = 'ai37-a2ui';
// v2: каталог расширен до НАДМНОЖЕСТВА базового A2UI (см. base-components.ts). Ломающее изменение
// набора → новый сегмент URL (v1 был только 5 доменных компонентов). CATALOG_ID/BASE_URL — ниже.
export const CATALOG_VERSION = 'v2';
/**
 * Хостинг каталога — GitHub Pages проекта `AI-37/ai37-a2ui-catalog`
 * (`https://ai-37.github.io/ai37-a2ui-catalog/`). Артефакты генерит
 * `generate-artifacts.ts --output <pages-dir>` в `a2ui/catalogs/<slug>/<version>/…`,
 * workflow `pages.yml` деплоит их в Pages. CATALOG_ID = резолвимый URL на `catalog.json`
 * (иммутабелен в пределах версии; ломающее изменение каталога → новый сегмент `/v2/`).
 */
export const CATALOG_BASE_URL = `https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/${CATALOG_SLUG}/${CATALOG_VERSION}`;
export const CATALOG_ID = `${CATALOG_BASE_URL}/catalog.json`;

/**
 * Id базового каталога A2UI (`basicCatalog` из `@a2ui/web_core` / `@a2ui/react`).
 * Это `catalog.id` инстанса базового каталога — не публичная константа пакета, поэтому
 * фиксируем её здесь. Нужен для content-negotiation: MIME `application/vnd.a2ui+json` (base)
 * маппится на этот id, а `application/vnd.a2ui.ai37+json` — на `CATALOG_ID` (ai37-каталог,
 * надмножество базового). См. negotiateOutput в @ai37/agent-sdk.
 *
 * ВНИМАНИЕ к версии каталога A2UI (это НЕ версия npm-пакета `@a2ui`):
 *  - `@a2ui` ≤ 0.10.0 регистрировал базовый каталог под `…/v0_9/basic_catalog.json` (эта ссылка отдаёт
 *    404 — устаревший путь);
 *  - `@a2ui` ≥ 0.10.1 — канонический `…/v0_9/catalogs/basic/catalog.json` (резолвится, 200; значение ниже).
 * Мы на `@a2ui` 0.10.1, поэтому используем канонический id. Источник истины — `basicCatalog.id` из
 * `@a2ui/react` установленной версии; но эта константа нужна и на сервере (агент объявляет каталог в
 * `createAgentHost({ catalogId })`), а сервер не тянет `@a2ui/react` (React), поэтому фиксируем здесь.
 * ПРИ АПГРЕЙДЕ `@a2ui` сверять с `basicCatalog.id`; catalog-react ассертит это равенство (drift-guard).
 */
export const A2UI_BASE_CATALOG_ID =
  'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';
export const CATALOG_TITLE = 'AI37 Custom A2UI Catalog';
export const CATALOG_COMPONENT_NAMES = [
  'SimpleTable',
  'FlexTable',
  'LatexFormula',
  'ChoiceCard',
  'FormCard',
] as const;

export type CatalogComponentName = (typeof CATALOG_COMPONENT_NAMES)[number];
