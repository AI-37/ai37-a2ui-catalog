/**
 * Выпускает версию каталога: бамп → артефакты → проверки → архив change'а →
 * релизный коммит → PR → публикация в приватный реестр → возврат потребителей
 * с тарболлов на версию из реестра.
 *
 * Зачем скрипт, а не чек-лист в скиле: цепочка длинная, шаги зависят друг от
 * друга и половина из них молча «получается» неправильно. Публикация react
 * раньше schemas ломает установку у потребителя; забытый `export:public`
 * роняет CI на `verify:public`; незаархивированный change копится в очереди
 * (на 2026-08-30 их 39 при одном архиве); потребитель, оставленный на
 * тарболлах, превращает стенд в зависимость от кода, которого нет ни у кого.
 * Каждый из этих промахов уже случался, и все они — механические.
 *
 * Чего скрипт НЕ делает: не придумывает фичевый коммит и не проходит гейты.
 * На вход он получает ветку, где работа уже закоммичена и проверена на стенде,
 * — то есть всё, что требует головы, к этому моменту сделано.
 *
 * Публикуют с релизной ветки, а не со смерженного main: реестр здесь давно
 * идёт за веткой (0.30.0–0.30.2 выпущены с feat/next-dark-theme и её стека).
 *
 * Использование:
 *   pnpm run release 0.30.3                        # с текущей ветки, PR в main
 *   pnpm run release 0.30.3 --change my-slug        # ещё и заархивировать change
 *   pnpm run release 0.30.3 --base feat/next-dark-theme   # стек-PR в ветку
 *   pnpm run release 0.30.3 --dry-run              # всё, кроме публикации и PR
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = 'https://npm.app.sp-ai.ru/';

/** Порядок обязателен: catalog-react зависит от схем диапазоном версий. */
const PACKAGES = ['@ai37/a2ui-catalog-schemas', '@ai37/a2ui-catalog-react'];

const run = (command, args, options = {}) =>
  execFileSync(command, args, {cwd: repoRoot, stdio: ['ignore', 'pipe', 'inherit'], ...options})
    .toString()
    .trim();

const stream = (command, args, options = {}) =>
  execFileSync(command, args, {cwd: repoRoot, stdio: 'inherit', ...options});

const stage = message => console.log(`\n▸ ${message}`);

const fail = message => {
  console.error(`\n✖ ${message}`);
  process.exit(1);
};

const parseArgs = argv => {
  const options = {consumers: [], dryRun: false, pr: true};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--no-pr') options.pr = false;
    else if (arg === '--change') options.change = argv[(i += 1)];
    else if (arg === '--base') options.base = argv[(i += 1)];
    else if (arg === '--consumer') options.consumers.push(argv[(i += 1)]);
    else if (arg.startsWith('--')) fail(`Не знаю опцию ${arg}`);
    else options.version = arg;
  }
  return options;
};

const options = parseArgs(process.argv.slice(2));
const version = options.version;
const base = options.base ?? 'main';
const consumers = options.consumers.length > 0 ? options.consumers : ['ui'];

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  fail('Нужна версия вида x.y.z: pnpm run release 0.30.3');
}

// --- Гейты до необратимых действий ------------------------------------------

stage('Проверки состояния');

const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (branch === base) fail(`Релизная ветка совпадает с базой (${base}) — PR будет некуда открыть`);

if (run('git', ['status', '--porcelain', '--untracked-files=no']) !== '') {
  fail('В дереве незакоммиченные правки. Фичевый коммит делается до релиза, руками.');
}

if (!process.env.AI37_NPM_TOKEN) {
  fail('AI37_NPM_TOKEN пуст — публикация уйдёт в 401. Токен в ~/.zshrc.');
}

// Версию в реестре нельзя перезаписать (EPUBLISHCONFLICT), и узнать об этом
// лучше до бампа и коммита, чем после.
const published = JSON.parse(
  run('npm', ['view', PACKAGES[1], 'versions', '--registry', REGISTRY, '--json']),
);
if (published.includes(version)) fail(`${version} уже в реестре — версию не перезаписать, нужен бамп`);

const changeDir = options.change
  ? path.join(repoRoot, 'openspec', 'changes', options.change)
  : undefined;
if (changeDir && !fs.existsSync(changeDir)) fail(`Не вижу change ${options.change} в openspec/changes`);

const changelogPath = path.join(repoRoot, 'CHANGELOG.md');
const changelog = fs.readFileSync(changelogPath, 'utf8');
if (!changelog.includes('## [Unreleased]')) {
  fail('В CHANGELOG.md нет раздела ## [Unreleased] — релизу нечего озаглавить');
}

console.log(`Ветка ${branch} → база ${base}, версия ${version}${options.dryRun ? ' (dry-run)' : ''}`);

// --- Сборка и артефакты ------------------------------------------------------

stage(`Бамп версии до ${version}`);
stream('pnpm', ['run', 'version:bump', version]);

stage('Установка и сборка пакетов');
stream('pnpm', ['install', '--frozen-lockfile']);
stream('pnpm', ['-r', '--filter', './packages/**', 'run', 'build']);

stage('Публичные артефакты');
stream('pnpm', ['run', 'export:public']);
stream('pnpm', ['run', 'verify:public']);

stage('CHANGELOG');
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(changelogPath, changelog.replace('## [Unreleased]', `## [${version}] - ${today}`));
console.log(`## [Unreleased] → ## [${version}] - ${today}`);

stage('Типы и тесты');
stream('pnpm', ['run', 'typecheck']);
stream('pnpm', ['run', 'test:ts']);

// Архивируется до коммита, чтобы спека, её дельта в openspec/specs и код
// уехали одним PR: отдельный спек-PR не вливается вместе с кодом и повисает.
if (options.change) {
  stage(`Архивация change ${options.change}`);
  stream('npx', ['openspec', 'archive', options.change, '-y']);
}

// --- Коммит, ветка, PR -------------------------------------------------------

stage(`Коммит chore(release): ${version}`);
stream('git', ['add', '-A', 'CHANGELOG.md', 'package.json', 'apps', 'packages', 'public', 'openspec']);
stream('git', ['commit', '-m', `chore(release): ${version}`]);

if (options.dryRun) {
  console.log('\ndry-run: пуш, PR и публикация пропущены. Коммит остался локально.');
  process.exit(0);
}

stage('Пуш ветки');
stream('git', ['push', '-u', 'origin', branch]);

if (options.pr) {
  stage('Pull request');
  const existing = run('gh', ['pr', 'list', '--head', branch, '--json', 'url', '--jq', '.[].url']);
  if (existing === '') {
    stream('gh', [
      'pr', 'create',
      '--base', base,
      '--head', branch,
      '--title', `chore(release): ${version}`,
      '--body', `Релиз ${version}. Код, тесты, артефакты public и change openspec — одним PR.`,
    ]);
  } else {
    console.log(`PR уже открыт: ${existing}`);
  }
}

// --- Публикация --------------------------------------------------------------

// Порядок schemas → react: react объявляет схемы диапазоном, и без них
// установка у потребителя уйдёт в реестр за версией, которой ещё нет.
for (const name of PACKAGES) {
  stage(`Публикация ${name}@${version}`);
  stream('pnpm', ['--filter', name, 'publish', '--no-git-checks']);
}

stage('Проверка реестра');
for (const name of PACKAGES) {
  const versions = JSON.parse(run('npm', ['view', name, 'versions', '--registry', REGISTRY, '--json']));
  if (!versions.includes(version)) fail(`${name}@${version} в реестре не появился`);
  console.log(`  ${name}@${version} — на месте`);
}

// --- Потребители обратно на реестр -------------------------------------------

// Оставить потребителя на тарболлах — это и есть отрыв каталога от реестра:
// стенд начинает зависеть от кода, которого нет ни у кого, кроме этой машины.
stage('Потребители на версию из реестра');
const CONSUMERS = {
  ui: '../spai-ui',
  keo: '../spai-daylight-factor-calc-agent',
  teplo: '../spai-teplo-calc',
  chat: '../spai-chat-backend',
};

for (const name of consumers) {
  const dir = path.resolve(repoRoot, CONSUMERS[name] ?? name);
  const manifestPath = path.join(dir, 'package.json');
  if (!fs.existsSync(manifestPath)) fail(`Не вижу потребителя ${dir}`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const declared = {...manifest.dependencies, ...manifest.devDependencies};
  const wanted = PACKAGES.filter(pkg => declared[pkg] !== undefined);
  if (wanted.length === 0) {
    console.log(`  ${name} — пакетов каталога не объявлено, пропуск`);
    continue;
  }

  run('npm', ['install', '--no-save', ...wanted.map(pkg => `${pkg}@${version}`)], {cwd: dir});
  for (const pkg of wanted) {
    const installed = JSON.parse(
      fs.readFileSync(path.join(dir, 'node_modules', pkg, 'package.json'), 'utf8'),
    );
    console.log(`  ${name}: ${pkg}@${installed.version}`);
  }
}

console.log(`\n✓ ${version} выпущена.`);
