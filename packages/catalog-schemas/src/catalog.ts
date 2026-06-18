import {zodToJsonSchema} from 'zod-to-json-schema';
import {
  CATALOG_BASE_URL,
  CATALOG_ID,
  CATALOG_TITLE,
  CATALOG_VERSION,
  type CatalogComponentName,
} from './constants';
import {flexTableDefinition} from './components/flex-table';
import {latexFormulaDefinition} from './components/latex-formula';
import {simpleTableDefinition} from './components/simple-table';
import {choiceCardDefinition} from './components/choice-card';
import {formCardDefinition} from './components/form-card';
import {getBaseComponentEntries} from './base-components';
import type {CatalogComponentDefinition, JsonSchema} from './types';

export const componentDefinitions = [
  simpleTableDefinition,
  flexTableDefinition,
  latexFormulaDefinition,
  choiceCardDefinition,
  formCardDefinition,
] as const satisfies ReadonlyArray<CatalogComponentDefinition<any>>;

export const componentDefinitionMap = new Map(
  componentDefinitions.map(definition => [definition.name, definition]),
);

export function getComponentDefinition(name: CatalogComponentName) {
  return componentDefinitionMap.get(name)!;
}

export function getComponentJsonSchema(name: CatalogComponentName): JsonSchema {
  const definition = getComponentDefinition(name);

  return zodToJsonSchema(definition.schema, {
    name: definition.name,
    target: 'jsonSchema2019-09',
    $refStrategy: 'none',
  }) as JsonSchema;
}

export function createCatalogArtifact() {
  return {
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    $id: CATALOG_ID,
    catalogId: CATALOG_ID,
    version: CATALOG_VERSION,
    title: CATALOG_TITLE,
    components: Object.fromEntries([
      // Базовые компоненты A2UI (Card, Column, Text, …) — каталог ai37 является их надмножеством.
      // Кладутся первыми, чтобы доменные ai37-компоненты перекрывали при совпадении имён.
      ...getBaseComponentEntries().map(entry => [
        entry.name,
        {
          description: entry.description,
          schemaPath: `${CATALOG_BASE_URL}/components/${entry.slug}.schema.json`,
          propsSchema: entry.propsSchema,
        },
      ]),
      // Доменные ai37-компоненты.
      ...componentDefinitions.map(definition => [
        definition.name,
        {
          description: definition.description,
          schemaPath: `${CATALOG_BASE_URL}/components/${definition.slug}.schema.json`,
          propsSchema: getComponentJsonSchema(definition.name as CatalogComponentName),
        },
      ]),
    ]),
  };
}
