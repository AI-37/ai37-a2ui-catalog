import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectCurrentVersionArtifacts, currentVersionDir} from '../packages/catalog-schemas/src/artifacts';
import {CATALOG_SLUG, CATALOG_VERSION} from '../packages/catalog-schemas/src/constants';

/**
 * Guard: ./public должен содержать АКТУАЛЬНЫЕ артефакты текущей версии каталога (CATALOG_VERSION),
 * совпадающие с тем, что даёт исходник. Ловит «забыл перегенерировать + закоммитить public/ после
 * правки компонентов» и «забыл сгенерировать новую версию после бампа». Используется в pages.yml
 * (перед деплоем) и ci.yml (на PR). Старые версии не проверяются — они заморожены.
 *
 * Починка при провале: `pnpm run export:public` + commit public/.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(repoRoot, 'public');

/** Детерминированная сериализация (сорт ключей) для сравнения независимо от порядка. */
function stable(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().map(k => [k, (v as Record<string, unknown>)[k]]))
      : v,
  );
}

const problems: string[] = [];

for (const [relPath, expected] of collectCurrentVersionArtifacts()) {
  const filePath = path.join(publicRoot, relPath);
  if (!fs.existsSync(filePath)) {
    problems.push(`ОТСУТСТВУЕТ: public/${relPath}`);
    continue;
  }
  const committed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (stable(committed) !== stable(expected)) {
    problems.push(`УСТАРЕЛ (не совпадает с исходником): public/${relPath}`);
  }
}

// index.html должен ссылаться на текущую версию.
const indexPath = path.join(publicRoot, 'index.html');
if (!fs.existsSync(indexPath)) {
  problems.push('ОТСУТСТВУЕТ: public/index.html');
} else if (!fs.readFileSync(indexPath, 'utf8').includes(`${currentVersionDir}/catalog.json`)) {
  problems.push(`index.html не ссылается на текущую версию (${CATALOG_VERSION})`);
}

if (problems.length > 0) {
  console.error(`✗ public/ не соответствует исходнику для ${CATALOG_SLUG}/${CATALOG_VERSION}:`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\nПочинка: pnpm run export:public && git add public && commit');
  process.exit(1);
}

console.log(`✓ public/ содержит актуальную версию ${CATALOG_SLUG}/${CATALOG_VERSION}`);
