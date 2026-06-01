import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const [, , baseSha, headSha] = process.argv;

if (!baseSha || !headSha) {
  console.error('Usage: node scripts/check-pr-release-metadata.mjs <base-sha> <head-sha>');
  process.exit(1);
}

const versionFiles = [
  'package.json',
  'packages/catalog-schemas/package.json',
  'packages/catalog-react/package.json',
  'apps/demo/package.json',
  'packages/catalog-python/pyproject.toml',
];

function readGitFile(revision, filePath) {
  return execFileSync('git', ['show', `${revision}:${filePath}`], {encoding: 'utf8'});
}

function parseVersion(filePath, content) {
  if (filePath.endsWith('.json')) {
    return JSON.parse(content).version;
  }

  const match = content.match(/^version = "([^"]+)"$/m);
  if (!match) {
    throw new Error(`Could not find a version in ${filePath}`);
  }

  return match[1];
}

function collectVersions(revision) {
  return new Map(
    versionFiles.map(filePath => [filePath, parseVersion(filePath, readGitFile(revision, filePath))]),
  );
}

function assertSingleVersion(label, versions) {
  const distinct = [...new Set(versions.values())];

  if (distinct.length !== 1) {
    console.error(`${label} contains mismatched versions:`);
    for (const [filePath, version] of versions) {
      console.error(`- ${filePath}: ${version}`);
    }
    process.exit(1);
  }

  return distinct[0];
}

function fileContainsAddedHeading(baseRevision, headRevision, version) {
  const diff = execFileSync('git', ['diff', '--unified=0', baseRevision, headRevision, '--', 'CHANGELOG.md'], {
    encoding: 'utf8',
  });
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingPattern = new RegExp(`^\\+## \\[${escapedVersion}\\]`, 'm');
  return headingPattern.test(diff);
}

const baseVersions = collectVersions(baseSha);
const headVersions = collectVersions(headSha);

const baseVersion = assertSingleVersion('Base revision', baseVersions);
const headVersion = assertSingleVersion('Head revision', headVersions);

if (baseVersion === headVersion) {
  console.error(`Pull request must bump the synchronized package version. Current version is still ${headVersion}.`);
  process.exit(1);
}

const changelogHead = readFileSync('CHANGELOG.md', 'utf8');
if (!new RegExp(`^## \\[${headVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'm').test(changelogHead)) {
  console.error(`CHANGELOG.md must include a heading for version ${headVersion}.`);
  process.exit(1);
}

if (!fileContainsAddedHeading(baseSha, headSha, headVersion)) {
  console.error(`CHANGELOG.md must add a new heading for version ${headVersion} in the pull request diff.`);
  process.exit(1);
}

process.stdout.write(`Validated synchronized version bump ${baseVersion} -> ${headVersion} and CHANGELOG entry.\n`);
