// Input validation and the auth user cache. No database needed.
const { test } = require('node:test');
const assert = require('node:assert');

const {
  ValidationError,
  normalizeTags,
  normalizeSourceUrl,
  parseSnippet,
  parseId,
  searchTerms,
} = require('../lib/validate.js');

test('tags: trimmed, empties dropped, duplicates removed case-insensitively', () => {
  assert.deepStrictEqual(normalizeTags(['js', ' JS ', 'Js', '', '  ', 'go', 'js']), ['js', 'go']);
  assert.deepStrictEqual(normalizeTags(undefined), []);
  assert.deepStrictEqual(normalizeTags(null), []);
});

test('tags: a string is rejected instead of being split into letters', () => {
  assert.throws(() => normalizeTags('abc'), ValidationError);
  assert.throws(() => normalizeTags({ 0: 'a' }), ValidationError);
  assert.throws(() => normalizeTags(['ok', 5]), ValidationError);
});

test('tags: length and count limits', () => {
  assert.throws(() => normalizeTags(['x'.repeat(101)]), ValidationError);
  assert.strictEqual(normalizeTags(['x'.repeat(100)]).length, 1);
  assert.throws(() => normalizeTags(Array.from({ length: 51 }, (_, i) => `t${i}`)), ValidationError);
});

test('source_url: only http and https', () => {
  assert.strictEqual(normalizeSourceUrl('https://example.com/a?b=c'), 'https://example.com/a?b=c');
  assert.strictEqual(normalizeSourceUrl(' http://example.com '), 'http://example.com');
  for (const empty of [undefined, null, '', '   ']) assert.strictEqual(normalizeSourceUrl(empty), null);
  for (const bad of [
    'javascript:alert(1)', 'JavaScript:alert(1)', ' javascript:alert(1)', 'data:text/html,<script>1</script>',
    'vbscript:x', 'file:///etc/passwd', 'ftp://example.com', 'example.com', '//example.com', 42, {},
    'https://example.com/' + 'a'.repeat(2100),
  ]) {
    assert.throws(() => normalizeSourceUrl(bad), ValidationError, String(bad).slice(0, 40));
  }
});

test('snippet: content is required, title is optional', () => {
  assert.deepStrictEqual(parseSnippet({ content: 'x' }), { title: null, content: 'x', source_url: null, tags: [] });
  assert.deepStrictEqual(
    parseSnippet({ title: ' T ', content: 'x', source_url: '', tags: ['a', 'A'] }),
    { title: 'T', content: 'x', source_url: null, tags: ['a'] }
  );
  for (const bad of [undefined, null, 'x', [], {}, { title: 't' }, { content: '' }, { content: '   ' }, { content: 5 },
    { content: 'x', title: 5 }, { content: 'x', title: 't'.repeat(501) }, { content: 'x'.repeat(60001) }]) {
    assert.throws(() => parseSnippet(bad), ValidationError);
  }
});

test('snippet: import rows also need a title', () => {
  assert.throws(() => parseSnippet({ content: 'x' }, { requireTitle: true }), /Missing required fields/);
  assert.throws(() => parseSnippet({ title: 't' }, { requireTitle: true }), /Missing required fields/);
  assert.strictEqual(parseSnippet({ title: 't', content: 'x' }, { requireTitle: true }).title, 't');
});

test('ids: positive integers only', () => {
  assert.strictEqual(parseId('12'), 12);
  for (const bad of ['0', '-1', '1.5', 'abc', '', '1e3', '99999999999', ' 1', undefined, 7]) {
    assert.strictEqual(parseId(bad), null, String(bad));
  }
});

test('search terms: split on whitespace, wildcards escaped, bounded', () => {
  assert.deepStrictEqual(searchTerms('  git   rebase '), ['git', 'rebase']);
  assert.deepStrictEqual(searchTerms('100%_done\\'), ['100\\%\\_done\\\\']);
  assert.deepStrictEqual(searchTerms(''), []);
  assert.deepStrictEqual(searchTerms(undefined), []);
  assert.deepStrictEqual(searchTerms(['a']), []);
  assert.strictEqual(searchTerms('a b c d e f g h i j').length, 8);
});

test('auth: the user row is written once, then served from the cache', async () => {
  const { userIdFor, userCache } = require('../middleware/auth.js');
  userCache.clear();
  let writes = 0;
  const upsert = async () => { writes++; return 42; };
  const who = { uid: 'u1', email: 'a@example.com', name: 'A' };

  assert.strictEqual(await userIdFor(who, 1000, upsert), 42);
  assert.strictEqual(await userIdFor(who, 2000, upsert), 42);
  assert.strictEqual(writes, 1);

  // a changed profile is written through
  assert.strictEqual(await userIdFor({ ...who, name: 'B' }, 3000, upsert), 42);
  assert.strictEqual(writes, 2);

  // and the entry expires after ten minutes
  assert.strictEqual(await userIdFor({ ...who, name: 'B' }, 3000 + 10 * 60 * 1000, upsert), 42);
  assert.strictEqual(writes, 3);
});

test('auth: a database failure is not cached and reaches the caller', async () => {
  const { userIdFor, userCache } = require('../middleware/auth.js');
  userCache.clear();
  const failing = async () => { throw Object.assign(new Error('down'), { code: 'ECONNREFUSED' }); };
  await assert.rejects(userIdFor({ uid: 'u2' }, 0, failing), /down/);
  assert.strictEqual(userCache.has('u2'), false);
  require('../db.js').end();
});
