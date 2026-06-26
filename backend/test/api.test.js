const { test, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server.js');
const db = require('../db.js');

// Distinct tag name. Cleanup at the end then only touches data this test file created.
const TEST_TAG = 'test-tag-day16';

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { ok: true });
});

test('GET /api/tags returns an array', async () => {
  const res = await request(app).get('/api/tags');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('snippet CRUD lifecycle', async () => {
  const create = await request(app)
    .post('/api/snippets')
    .send({ title: 'Day 16 test', content: 'hello', source_url: null, tags: [TEST_TAG] });
  assert.strictEqual(create.status, 201);
  const id = create.body.id;

  const list = await request(app).get('/api/snippets');
  assert.ok(list.body.some(s => s.id === id));

  const update = await request(app)
    .put(`/api/snippets/${id}`)
    .send({ title: 'Day 16 updated', content: 'hello again', source_url: null, tags: [TEST_TAG] });
  assert.strictEqual(update.status, 200);

  const del = await request(app).delete(`/api/snippets/${id}`);
  assert.strictEqual(del.status, 204);
});

test('GET /api/snippets filters by tag', async () => {
  // Create a fresh snippet here so this test doesn't depend on the CRUD test running first.
  const create = await request(app)
    .post('/api/snippets')
    .send({ title: 'tag filter test', content: 'x', source_url: null, tags: [TEST_TAG] });
  const id = create.body.id;

  const filtered = await request(app).get(`/api/snippets?tag=${TEST_TAG}`);
  assert.strictEqual(filtered.status, 200);
  assert.ok(filtered.body.some(s => s.id === id));

  await request(app).delete(`/api/snippets/${id}`);
});

test('import/export endpoints 401 without token', async () => {
  const getRes = await request(app)
    .get('/api/snippets/export')
    .set('Authorization', 'Bearer none');
  assert.strictEqual(getRes.status, 401);

  const postRes = await request(app)
    .post('/api/snippets/import')
    .set('Authorization', 'Bearer none')
    .send({ format: 'snippetmate-export', version: 1, snippets: [] });
  assert.strictEqual(postRes.status, 401);
});

test('import rejects foreign format/version', async () => {
  const res = await request(app)
    .post('/api/snippets/import')
    .send({ format: 'wrong-format', version: 1, snippets: [] });
  assert.strictEqual(res.status, 400);

  const res2 = await request(app)
    .post('/api/snippets/import')
    .send({ format: 'snippetmate-export', version: 2, snippets: [] });
  assert.strictEqual(res2.status, 400);
});

test('import handles valid rows and reports malformed rows', async () => {
  const payload = {
    format: 'snippetmate-export',
    version: 1,
    snippets: [
      { title: 'valid 1', content: 'content 1', source_url: null, tags: [TEST_TAG] },
      { title: 'invalid missing content', source_url: null },
      { title: 'valid 2', content: 'content 2', source_url: 'https://example.com', tags: [TEST_TAG] }
    ]
  };

  const res = await request(app).post('/api/snippets/import').send(payload);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.imported, 2);
  assert.strictEqual(res.body.skipped, 0);
  assert.strictEqual(res.body.errors.length, 1);
  assert.strictEqual(res.body.errors[0].title, 'invalid missing content');
});

test('import skips duplicates', async () => {
  const payload = {
    format: 'snippetmate-export',
    version: 1,
    snippets: [
      { title: 'valid 1 duplicated', content: 'content 1', source_url: null, tags: [] }
    ]
  };
  const res = await request(app).post('/api/snippets/import').send(payload);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.imported, 0);
  assert.strictEqual(res.body.skipped, 1);
});

test('export returns canonical JSON', async () => {
  const res = await request(app).get('/api/snippets/export');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.format, 'snippetmate-export');
  assert.strictEqual(res.body.version, 1);
  assert.ok(Array.isArray(res.body.snippets));
  
  const s1 = res.body.snippets.find(s => s.content === 'content 1');
  assert.ok(s1);
  assert.strictEqual(s1.title, 'valid 1');
});

test('round-trip into a second uid matches', async () => {
  const exportRes = await request(app).get('/api/snippets/export');
  assert.strictEqual(exportRes.status, 200);
  const payload = exportRes.body;

  const importRes = await request(app)
    .post('/api/snippets/import')
    .set('Authorization', 'Bearer user2')
    .send(payload);
  assert.strictEqual(importRes.status, 200);
  assert.strictEqual(importRes.body.errors.length, 0);

  const exportRes2 = await request(app)
    .get('/api/snippets/export')
    .set('Authorization', 'Bearer user2');
  assert.strictEqual(exportRes2.status, 200);
  
  assert.strictEqual(exportRes2.body.snippets.length, payload.snippets.length);
  const s1 = exportRes2.body.snippets.find(s => s.content === 'content 1');
  assert.ok(s1);
  assert.strictEqual(s1.title, 'valid 1');
});

after(async () => {
  await db.query('DELETE FROM tags WHERE name = ?', [TEST_TAG]);
  await db.query("DELETE FROM snippets WHERE title LIKE 'valid %'");
  await db.end();
});