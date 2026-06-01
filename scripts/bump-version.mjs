import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const [, , nextVersion] = process.argv;

if (!nextVersion) {
  console.error('Usage: pnpm run version:bump <version>');
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

const updateJsonVersion = filePath => {
  const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
  parsed.version = nextVersion;
  writeFileSync(filePath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
};

updateJsonVersion(path.join(repoRoot, 'package.json'));
updateJsonVersion(path.join(repoRoot, 'packages/catalog-schemas/package.json'));
updateJsonVersion(path.join(repoRoot, 'packages/catalog-react/package.json'));
updateJsonVersion(path.join(repoRoot, 'apps/demo/package.json'));

const pythonFile = path.join(repoRoot, 'packages/catalog-python/pyproject.toml');
const pythonContent = readFileSync(pythonFile, 'utf8').replace(
  /^version = ".*"$/m,
  `version = "${nextVersion}"`,
);
writeFileSync(pythonFile, pythonContent, 'utf8');

process.stdout.write(`Updated repository version to ${nextVersion}\n`);
