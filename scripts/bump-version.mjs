import {spawnSync} from 'node:child_process';
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

/*
 * `uv.lock` держит версию самого пакета, поэтому после правки `pyproject.toml`
 * он обязан перегенерироваться: иначе `uv sync` видит lock неактуальным, а
 * ревью ловит расхождение на каждом релизе (0.30.2, 0.30.4, 0.30.5 — трижды
 * одно и то же). Скрипт старше lock-файла на два месяца и просто про него не
 * знал.
 *
 * `--offline`: пересчитывается только версия своего пакета, за зависимостями в
 * сеть ходить незачем — и bump не должен зависеть от неё.
 *
 * Нет `uv` — предупреждение, а не ошибка: версии в манифестах уже записаны, и
 * ронять весь bump из-за lock-файла значит оставить репозиторий на полпути.
 * Строка предупреждения называет команду, которой чинить.
 */
const lock = spawnSync('uv', ['lock', '--offline'], {
  cwd: path.join(repoRoot, 'packages/catalog-python'),
  encoding: 'utf8',
});

if (lock.error !== undefined || lock.status !== 0) {
  process.stderr.write(
    `! uv.lock не перегенерирован (${lock.error?.message ?? `uv lock: код ${lock.status}`}).\n` +
      '  Выполните вручную: cd packages/catalog-python && uv lock\n',
  );
}

process.stdout.write(`Updated repository version to ${nextVersion}\n`);
