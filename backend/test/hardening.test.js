// API behaviour for duplicate tags, validation, search and large imports.
// Needs the test database (see README: DB_NAME must end in "_test").
const { test, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server.js');
const db = require('../db.js');

if (!/_test$/.test(process.env.DB_NAME || '')) {
  throw new Error(
    `Refusing to run API tests against database "${process.env.DB_NAME}": DB_NAME must end in "_test".`
  );
}

const MARK = 'hardening-test';
const created = [];

async function create(body) {
  const res = await request(app).post('/api/snippets').send(body);
  if (res.status === 201) created.push(res.body.id);
  return res;
}

async function list(query = '') {
  const res = await request(app).get('/api/snippets' + query);
  assert.strictEqual(res.status, 200);
  return res.body;
}

test('duplicate tags (case, spacing, accents) save once instead of failing', async () => {
  const before = (await list()).length;
  const res = await create({ title: `${MARK} dup`, content: 'x', tags: ['dupTag', 'DUPTAG', ' duptag ', 'café-ht', 'cafe-ht'] });
  assert.strictEqual(res.status, 201, JSON.stringify(res.body));

  const all = await list();
  assert.strictEqual(all.length, before + 1);
  const saved = all.find((s) => s.id === res.body.id);
  assert.strictEqual(saved.tags.filter((t) => t.toLowerCase() === 'duptag').length, 1);
  assert.ok(saved.tags.length >= 2 && saved.tags.length <= 3, JSON.stringify(saved.tags));

  const put = await request(app).put(`/api/snippets/${res.body.id}`)
    .send({ title: `${MARK} dup`, content: 'x', tags: ['a-ht', 'A-HT', 'b-ht'] });
  assert.strictEqual(put.status, 200);
  const after = (await list()).find((s) => s.id === res.body.id);
  assert.deepStrictEqual(after.tags.map((t) => t.toLowerCase()).sort(), ['a-ht', 'b-ht']);
});

test('invalid bodies answer 400 with a message and save nothing', async () => {
  const before = (await list()).length;
  for (const body of [
    { title: `${MARK} no content` },
    { title: `${MARK} blank`, content: '   ' },
    { title: `${MARK} tags string`, content: 'x', tags: 'abc' },
    { title: `${MARK} js url`, content: 'x', source_url: 'javascript:alert(1)' },
    { title: `${MARK} long tag`, content: 'x', tags: ['x'.repeat(101)] },
    { title: 't'.repeat(501), content: 'x' },
  ]) {
    const res = await request(app).post('/api/snippets').send(body);
    assert.strictEqual(res.status, 400, JSON.stringify(body).slice(0, 60));
    assert.strictEqual(typeof res.body.error, 'string');
  }
  assert.strictEqual((await list()).length, before);
});

test('an update cannot set a javascript: link, and the old value stays', async () => {
  const res = await create({ title: `${MARK} url`, content: 'x', source_url: 'https://example.com/ok' });
  const put = await request(app).put(`/api/snippets/${res.body.id}`)
    .send({ title: `${MARK} url`, content: 'x', source_url: 'javascript:alert(1)' });
  assert.strictEqual(put.status, 400);
  const saved = (await list()).find((s) => s.id === res.body.id);
  assert.strictEqual(saved.source_url, 'https://example.com/ok');
});

test('import reports rows with bad links or tags and imports the rest', async () => {
  const res = await request(app).post('/api/snippets/import').send({
    format: 'snippetmate-export',
    version: 1,
    snippets: [
      { title: `${MARK} import ok`, content: `${MARK} import content ok`, source_url: 'https://example.com', tags: ['imp-ht', 'IMP-HT'] },
      { title: `${MARK} import js`, content: `${MARK} import content js`, source_url: 'javascript:alert(document.cookie)' },
      { title: `${MARK} import tags`, content: `${MARK} import content tags`, tags: 'abc' },
      'not an object',
      null,
    ],
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.imported, 1);
  assert.strictEqual(res.body.errors.length, 4);
  assert.match(res.body.errors[0].error, /http/);

  const all = await list();
  assert.ok(!all.some((s) => /^javascript:/i.test(s.source_url || '')));
  assert.deepStrictEqual(all.find((s) => s.title === `${MARK} import ok`).tags.map((t) => t.toLowerCase()), ['imp-ht']);
});

test('search matches prefixes, two-letter words and literal wildcards', async () => {
  await create({ title: `${MARK} Snippet about rebasing`, content: 'git rebase -i HEAD~3' });
  await create({ title: `${MARK} other`, content: 'use js or go here zqxj' });
  await create({ title: `${MARK} percent`, content: 'progress 100% done zqxj' });

  const titles = async (q) => (await list('?q=' + encodeURIComponent(q))).map((s) => s.title);

  assert.ok((await titles('snip rebas')).includes(`${MARK} Snippet about rebasing`), 'prefix words');
  assert.ok((await titles('js')).includes(`${MARK} other`), 'two-letter word');
  assert.ok((await titles('go zqxj')).includes(`${MARK} other`), 'all words must match');
  assert.deepStrictEqual(await titles('100% zqxj'), [`${MARK} percent`], 'percent sign is literal');
  assert.deepStrictEqual(await titles('zqxj-no-such-thing'), []);
  assert.deepStrictEqual(await titles('%'), [`${MARK} percent`], 'a lone % does not match everything');
});

test('search puts title matches before content-only matches', async () => {
  await create({ title: `${MARK} plain`, content: 'mentions wxyzterm in the body' });
  await create({ title: `${MARK} wxyzterm in title`, content: 'body' });
  const titles = (await list('?q=wxyzterm')).map((s) => s.title);
  assert.deepStrictEqual(titles, [`${MARK} wxyzterm in title`, `${MARK} plain`]);
});

test('an import larger than 100 KB is accepted', async () => {
  const snippets = Array.from({ length: 150 }, (_, i) => ({
    title: `${MARK} big ${i}`,
    content: `${MARK} big content ${i} ` + 'x'.repeat(2000),
    tags: ['big-ht'],
  }));
  const body = { format: 'snippetmate-export', version: 1, snippets };
  assert.ok(JSON.stringify(body).length > 300 * 1024);

  const res = await request(app).post('/api/snippets/import').send(body);
  assert.strictEqual(res.status, 200, JSON.stringify(res.body).slice(0, 200));
  assert.strictEqual(res.body.imported, 150);
  assert.strictEqual(res.body.errors.length, 0);
});

test('errors are JSON: bad JSON, oversized body, unknown path, bad id', async () => {
  const bad = await request(app).post('/api/snippets').set('Content-Type', 'application/json').send('{not json');
  assert.strictEqual(bad.status, 400);
  assert.deepStrictEqual(bad.body, { error: 'Invalid JSON' });

  const huge = await request(app).post('/api/snippets/import')
    .set('Content-Type', 'application/json').send('{"x":"' + 'a'.repeat(6 * 1024 * 1024) + '"}');
  assert.strictEqual(huge.status, 413);
  assert.match(huge.body.error, /too large/i);

  const unknown = await request(app).get('/api/nope');
  assert.strictEqual(unknown.status, 404);
  assert.deepStrictEqual(unknown.body, { error: 'Not found' });

  for (const id of ['abc', '1.5', '0', '99999999999']) {
    assert.strictEqual((await request(app).delete(`/api/snippets/${id}`)).status, 404, id);
    assert.strictEqual((await request(app).put(`/api/snippets/${id}`).send({ content: 'x' })).status, 404, id);
  }
});

test('another user cannot edit or delete my snippet', async () => {
  const res = await create({ title: `${MARK} mine`, content: 'private' });
  const asOther = { Authorization: 'Bearer user2' };
  assert.strictEqual((await request(app).put(`/api/snippets/${res.body.id}`).set(asOther).send({ content: 'hacked' })).status, 404);
  assert.strictEqual((await request(app).delete(`/api/snippets/${res.body.id}`).set(asOther)).status, 404);
  assert.strictEqual((await list()).find((s) => s.id === res.body.id).content, 'private');
});

test('health: liveness and database readiness', async () => {
  assert.deepStrictEqual((await request(app).get('/api/health')).body, { ok: true });
  const ready = await request(app).get('/api/health/db');
  assert.strictEqual(ready.status, 200);
  assert.deepStrictEqual(ready.body, { ok: true, db: true });
});

after(async () => {
  await db.query('DELETE FROM snippets WHERE title LIKE ?', [`${MARK}%`]);
  await db.query("DELETE FROM tags WHERE name LIKE '%-ht' OR name IN ('dupTag', 'DUPTAG', 'duptag')");
  await db.end();
});
