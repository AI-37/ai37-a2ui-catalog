import fs from 'node:fs/promises';
import path from 'node:path';
import {createCatalogArtifact, getComponentJsonSchema} from './catalog';
import {collectCurrentVersionArtifacts} from './artifacts';
import {CATALOG_COMPONENT_NAMES, CATALOG_SLUG, type CatalogComponentName} from './constants';

async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

/**
 * index.html со списком ВСЕХ версий, присутствующих в `<outputRoot>/a2ui/catalogs/<slug>/` (текущая
 * только что записана, старые заморожены в закоммиченном public/). Генерируется явно здесь, а НЕ в
 * workflow — public/ это источник правды, воркфлоу только деплоит.
 */
async function writeIndexHtml(outputRoot: string) {
  const catalogsRoot = path.join(outputRoot, 'a2ui', 'catalogs', CATALOG_SLUG);
  const entries = await fs.readdir(catalogsRoot, {withFileTypes: true});
  const versions = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();

  const items = versions
    .map(v => `  <li><a href="./a2ui/catalogs/${CATALOG_SLUG}/${v}/catalog.json">${CATALOG_SLUG} / ${v} — catalog.json</a></li>`)
    .join('\n');

  const html = [
    '<!doctype html>',
    '<meta charset="utf-8">',
    '<title>AI37 A2UI Catalog</title>',
    '<h1>AI37 A2UI Catalog</h1>',
    '<p>Каталог декларативного UI (A2UI) экосистемы AI37. Версии иммутабельны.</p>',
    '<ul>',
    items,
    '</ul>',
    '',
  ].join('\n');

  await fs.writeFile(path.join(outputRoot, 'index.html'), html, 'utf8');
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
  // Пишем ТОЛЬКО текущую версию (catalog.json + схемы компонентов, ai37 + базовые). Старые версии в
  // outputRoot не трогаются (заморожены), поэтому генерация поверх закоммиченного public/ накапливает.
  for (const [relPath, value] of collectCurrentVersionArtifacts()) {
    await writeJson(path.join(outputRoot, relPath), value);
  }

  await writeIndexHtml(outputRoot);
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
