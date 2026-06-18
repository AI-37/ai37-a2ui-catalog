import {componentDefinitions, createCatalogArtifact, getComponentJsonSchema} from './catalog';
import {getBaseComponentEntries} from './base-components';
import {CATALOG_SLUG, CATALOG_VERSION, type CatalogComponentName} from './constants';

/** Корень версии каталога относительно Pages-сайта (`./public`). */
export const currentVersionDir = `a2ui/catalogs/${CATALOG_SLUG}/${CATALOG_VERSION}`;

/**
 * Артефакты ТЕКУЩЕЙ версии каталога: относительный путь → JSON-значение (`catalog.json` + JSON Schema
 * каждого компонента, ai37 + базовые). Единый источник правды для генерации (`generate-artifacts`,
 * пишет файлы) и guard'а (`verify-public`, сверяет с закоммиченным `public/`). Старые версии сюда НЕ
 * входят — они заморожены в `public/` и не регенерируются.
 */
export function collectCurrentVersionArtifacts(): Map<string, unknown> {
  const files = new Map<string, unknown>();

  files.set(`${currentVersionDir}/catalog.json`, createCatalogArtifact());

  for (const definition of componentDefinitions) {
    files.set(
      `${currentVersionDir}/components/${definition.slug}.schema.json`,
      getComponentJsonSchema(definition.name as CatalogComponentName),
    );
  }

  for (const entry of getBaseComponentEntries()) {
    files.set(`${currentVersionDir}/components/${entry.slug}.schema.json`, entry.propsSchema);
  }

  return files;
}
