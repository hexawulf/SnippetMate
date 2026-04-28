const { test, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server.js');
const db = require('../db.js');

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
  const create = await request(app)
    .post('/api/snippets')
    .send({ title: 'tag filter test', content: 'x', source_url: null, tags: [TEST_TAG] });
  const id = create.body.id;

  const filtered = await request(app).get(`/api/snippets?tag=${TEST_TAG}`);
  assert.strictEqual(filtered.status, 200);
  assert.ok(filtered.body.some(s => s.id === id));

  await request(app).delete(`/api/snippets/${id}`);
});

after(async () => {
  await db.query('DELETE FROM tags WHERE name = ?', [TEST_TAG]);
  await db.end();
});