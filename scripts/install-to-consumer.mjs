/**
 * Ставит локальную сборку пакетов каталога в потребителя, минуя реестр.
 *
 * Зачем тарболлы, а не `npm link`: симлинк заставляет бандлер потребителя
 * резолвить `react` из node_modules каталога (он там есть как devDependency) —
 * получаются две копии React и «Invalid hook call». Тарболл распаковывается в
 * node_modules потребителя как обычная зависимость, дублей нет.
 *
 * `npm i --no-save` — package.json и lock потребителя не трогаем: это стенд для
 * проверки, а не изменение его зависимостей. После `npm ci`/`npm i` всё
 * вернётся к версии из lock'а.
 *
 * Использование: pnpm run install:consumer [путь] (по умолчанию ../spai-ui)
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const consumer = path.resolve(repoRoot, process.argv[2] ?? '../spai-ui');
const outDir = path.join(repoRoot, 'node_modules', '.local-tarballs');

if (!fs.existsSync(path.join(consumer, 'package.json'))) {
  console.error(`Не вижу потребителя: ${consumer}`);
  process.exit(1);
}

const run = (command, args, cwd) =>
  execFileSync(command, args, {cwd, stdio: ['ignore', 'pipe', 'inherit']}).toString().trim();

console.log('Сборка пакетов…');
run('pnpm', ['-r', '--filter', './packages/**', 'run', 'build'], repoRoot);

fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});

// Порядок важен: react зависит от schemas, и npm должен видеть оба тарболла
// в одной установке — иначе он пойдёт за schemas в реестр, где этой версии ещё нет.
const tarballs = ['@ai37/a2ui-catalog-schemas', '@ai37/a2ui-catalog-react'].map(name => {
  const file = run('pnpm', ['--filter', name, 'pack', '--pack-destination', outDir], repoRoot)
    .split('\n')
    .pop();
  console.log(`${name} → ${path.basename(file)}`);
  return file;
});

console.log(`Установка в ${consumer}…`);
run('npm', ['install', '--no-save', ...tarballs], consumer);

for (const name of ['@ai37/a2ui-catalog-schemas', '@ai37/a2ui-catalog-react']) {
  const installed = JSON.parse(
    fs.readFileSync(path.join(consumer, 'node_modules', name, 'package.json'), 'utf8'),
  );
  console.log(`${name}@${installed.version} — на месте`);
}
