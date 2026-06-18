import {BASIC_COMPONENTS} from '@a2ui/web_core/v0_9/basic_catalog';
import {zodToJsonSchema} from 'zod-to-json-schema';
import type {JsonSchema} from './types';

/**
 * Базовые компоненты A2UI (`Card`, `Column`, `Text`, …) из basic-каталога `@a2ui/web_core`.
 *
 * Каталог ai37 — НАДМНОЖЕСТВО базового (рантайм `ai37Catalog` в `catalog-react` уже мерджит
 * `basicCatalog.components` с кастомными). Чтобы опубликованный контракт `catalog.json` соответствовал
 * рантайму (и негоциация/валидация знали про базовые компоненты под `CATALOG_ID` — например, для
 * вложенности `Card > LatexFormula`), эти определения подмешиваются в `createCatalogArtifact()`.
 *
 * Источник схем — `BASIC_COMPONENTS` (массив `{ name, schema: ZodTypeAny }`); прогоняются тем же
 * `zodToJsonSchema(..., { $refStrategy: 'none' })`, что и доменные ai37-компоненты (self-contained,
 * без `$ref`), без ручного дублирования.
 */

/** PascalCase → kebab-case: `Text` → `text`, `AudioPlayer` → `audio-player`. */
function slugify(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export interface BaseComponentEntry {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly propsSchema: JsonSchema;
}

/** Определения базовых компонентов A2UI для подмешивания в артефакт каталога. */
export function getBaseComponentEntries(): BaseComponentEntry[] {
  return BASIC_COMPONENTS.map(component => {
    const description =
      component.schema.description ??
      `Базовый компонент A2UI «${component.name}» (basic-каталог @a2ui).`;

    return {
      name: component.name,
      slug: slugify(component.name),
      description,
      propsSchema: zodToJsonSchema(component.schema, {
        name: component.name,
        target: 'jsonSchema2019-09',
        $refStrategy: 'none',
      }) as JsonSchema,
    };
  });
}
