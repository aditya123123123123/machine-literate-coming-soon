// Unit tests for api/waitlist.js. No database needed: the handler runs in
// dry-run mode unless VERCEL_ENV is "production".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import handler from '../api/waitlist.js';

function call({ method = 'POST', body = '', headers = {} } = {}) {
  const req = Readable.from(body ? [Buffer.from(body)] : []);
  req.method = method;
  req.headers = { 'content-type': 'application/json', accept: 'application/json', ...headers };
  return new Promise(resolve => {
    const res = {
      statusCode: 200, headers: {},
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      end(data) { resolve({ status: this.statusCode, headers: this.headers, json: data ? JSON.parse(data) : null }); },
    };
    handler(req, res);
  });
}
const post = obj => call({ body: JSON.stringify(obj) });

test('rejects non-POST', async () => {
  const r = await call({ method: 'GET' });
  assert.equal(r.status, 405);
});

test('rejects a bad email', async () => {
  assert.equal((await post({ role: 'parent', email: 'nope' })).json.error, 'email');
});

test('student must give an age', async () => {
  const r = await post({ role: 'student', email: 'a@example.com' });
  assert.equal(r.status, 400);
  assert.equal(r.json.error, 'age');
});

test('accepts form-encoded bodies too', async () => {
  const r = await call({ body: 'role=teacher&email=t%40example.com', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.equal(r.status, 200);
  assert.equal(r.json.ok, true);
});

test('honeypot submissions are silently accepted', async () => {
  const r = await post({ role: 'parent', email: 'bot@example.com', website: 'spam' });
  assert.deepEqual(r.json, { ok: true });
});

test('outside production nothing is written (dry run)', async () => {
  const r = await post({ role: 'student', age: 'under13', email: 'kid@example.com' });
  assert.equal(r.status, 200);
  assert.equal(r.json.dryRun, true);
});

test('oversized bodies are refused', async () => {
  const r = await post({ role: 'parent', email: 'a@example.com', pad: 'x'.repeat(4000) });
  assert.equal(r.status, 413);
});
