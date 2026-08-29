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
 * Потребителей несколько, и берут они РАЗНОЕ: агенты (КЕО, теплотехника, чат)
 * собирают props и живут на одних схемах, UI ещё и рендерит. Поэтому каждому
 * ставятся ровно те пакеты, что объявлены в его package.json: лишний
 * catalog-react в агенте притащил бы React в зависимости бэкенда.
 *
 * Использование:
 *   pnpm run install:consumer                 # spai-ui (по умолчанию)
 *   pnpm run install:consumer keo teplo       # по коротким именам
 *   pnpm run install:consumer all             # все известные потребители
 *   pnpm run install:consumer ../spai-ui      # путь тоже принимается
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, 'node_modules', '.local-tarballs');

/** Известные потребители каталога: короткое имя → путь рядом с репозиторием. */
const CONSUMERS = {
  ui: '../spai-ui',
  keo: '../spai-daylight-factor-calc-agent',
  teplo: '../spai-teplo-calc',
  chat: '../spai-chat-backend',
};

/** Пакеты каталога в порядке зависимости: react тянет schemas. */
const PACKAGES = ['@ai37/a2ui-catalog-schemas', '@ai37/a2ui-catalog-react'];

const run = (command, args, cwd) =>
  execFileSync(command, args, {cwd, stdio: ['ignore', 'pipe', 'inherit']}).toString().trim();

const resolveConsumer = name => {
  const target = CONSUMERS[name] ?? name;
  return path.resolve(repoRoot, target);
};

const requested = process.argv.slice(2);
const names = requested.length === 0 ? ['ui'] : requested;
const consumers = (names.includes('all') ? Object.keys(CONSUMERS) : names).map(resolveConsumer);

const missing = consumers.filter(dir => !fs.existsSync(path.join(dir, 'package.json')));
if (missing.length > 0) {
  console.error(`Не вижу потребителя: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('Сборка пакетов…');
run('pnpm', ['-r', '--filter', './packages/**', 'run', 'build'], repoRoot);

fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});

// Пакуются оба, даже если потребитель берёт один: npm должен видеть schemas
// вместе с react в одной установке — иначе он пойдёт за schemas в реестр, где
// этой версии ещё нет.
const tarballs = new Map(
  PACKAGES.map(name => {
    const file = run('pnpm', ['--filter', name, 'pack', '--pack-destination', outDir], repoRoot)
      .split('\n')
      .pop();
    console.log(`${name} → ${path.basename(file)}`);
    return [name, file];
  }),
);

for (const consumer of consumers) {
  const manifest = JSON.parse(fs.readFileSync(path.join(consumer, 'package.json'), 'utf8'));
  const declared = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies,
  };
  // Потребителю ставится то, что он объявил; catalog-react без schemas
  // неработоспособен, поэтому schemas добавляется к нему сам.
  const wanted = PACKAGES.filter(
    name => declared[name] !== undefined || (name === PACKAGES[0] && declared[PACKAGES[1]] !== undefined),
  );

  if (wanted.length === 0) {
    console.log(`${path.basename(consumer)} — пакетов каталога не объявлено, пропуск`);
    continue;
  }

  console.log(`Установка в ${consumer}…`);
  run('npm', ['install', '--no-save', ...wanted.map(name => tarballs.get(name))], consumer);

  for (const name of wanted) {
    const installed = JSON.parse(
      fs.readFileSync(path.join(consumer, 'node_modules', name, 'package.json'), 'utf8'),
    );
    console.log(`  ${name}@${installed.version} — на месте`);
  }
}
