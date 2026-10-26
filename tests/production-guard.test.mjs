// Tests for deploy/production-guard.mjs, which keeps production builds on `main`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { checkProductionRef } from '../deploy/production-guard.mjs';

const guard = new URL('../deploy/production-guard.mjs', import.meta.url).pathname;

function run(env) {
  try {
    execFileSync(process.execPath, [guard], { env: { PATH: process.env.PATH, ...env }, stdio: 'pipe' });
    return 0;
  } catch (err) {
    return err.status;
  }
}

test('allows production builds from main', () => {
  assert.equal(checkProductionRef({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' }).ok, true);
  assert.equal(run({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' }), 0);
});

test('blocks a feature branch promoted to production', () => {
  const r = checkProductionRef({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'chore/vercel-web-analytics' });
  assert.equal(r.ok, false);
  assert.match(r.message, /chore\/vercel-web-analytics/);
  assert.equal(run({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'chore/vercel-web-analytics' }), 1);
});

test('blocks preprod promoted to production', () => {
  assert.equal(run({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'preprod' }), 1);
});

test('blocks production builds with no Git branch (manual CLI deploys)', () => {
  assert.equal(run({ VERCEL_ENV: 'production' }), 1);
});

test('leaves preview and local builds alone', () => {
  assert.equal(run({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'chore/anything' }), 0);
  assert.equal(run({}), 0);
});

test('vercel.json runs the guard as the build command', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  assert.equal(config.buildCommand, 'node deploy/production-guard.mjs');
});

test('.vercelignore does not strip the guard from the upload', () => {
  const ignored = readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8')
    .split('\n').map(l => l.trim().replace(/^\//, '')).filter(Boolean);
  assert.ok(!ignored.some(p => p === 'deploy' || p.startsWith('deploy/')));
});
