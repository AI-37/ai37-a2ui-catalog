import fs from 'node:fs/promises';
import path from 'node:path';
import {createCatalogArtifact, componentDefinitions, getComponentJsonSchema} from './catalog';
import {CATALOG_COMPONENT_NAMES, CATALOG_SLUG, CATALOG_VERSION, type CatalogComponentName} from './constants';

async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function parseArgs(argv: string[]) {
  const args = [...argv];
  let outputRoot: string | undefined;
  let printCatalog = false;
  let componentName: CatalogComponentName | undefined;

  while (args.length > 0) {
    const current = args.shift();

    if (current === '--') {
      continue;
    }

    if (current === '--output') {
      outputRoot = args.shift();
      continue;
    }

    if (current === '--catalog') {
      printCatalog = true;
      continue;
    }

    if (current === '--component') {
      const rawName = args.shift();

      if (!rawName || !CATALOG_COMPONENT_NAMES.includes(rawName as CatalogComponentName)) {
        throw new Error(`Unknown component name: ${rawName ?? '<missing>'}`);
      }

      componentName = rawName as CatalogComponentName;
      continue;
    }

    throw new Error(`Unknown argument: ${current}`);
  }

  return {outputRoot, printCatalog, componentName};
}

async function exportArtifacts(outputRoot: string) {
  const hostingRoot = path.join(outputRoot, 'a2ui', 'catalogs', CATALOG_SLUG, CATALOG_VERSION);

  const catalogArtifact = createCatalogArtifact();

  await writeJson(path.join(hostingRoot, 'catalog.json'), catalogArtifact);

  for (const definition of componentDefinitions) {
    const schema = getComponentJsonSchema(definition.name as CatalogComponentName);
    await writeJson(path.join(hostingRoot, 'components', `${definition.slug}.schema.json`), schema);
  }
}

async function main() {
  const {outputRoot, printCatalog, componentName} = parseArgs(process.argv.slice(2));

  if (outputRoot) {
    await exportArtifacts(path.resolve(outputRoot));
    return;
  }

  if (printCatalog) {
    process.stdout.write(`${JSON.stringify(createCatalogArtifact(), null, 2)}\n`);
    return;
  }

  if (componentName) {
    process.stdout.write(`${JSON.stringify(getComponentJsonSchema(componentName), null, 2)}\n`);
    return;
  }

  throw new Error('Usage: tsx packages/catalog-schemas/src/generate-artifacts.ts --output <dir> | --catalog | --component <name>');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
