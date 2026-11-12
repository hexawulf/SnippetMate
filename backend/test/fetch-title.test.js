// Tests for the SSRF guard around /api/fetch-title. No database needed.
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const express = require('express');
const request = require('supertest');

const {
  fetchTitle,
  parseAllowedUrl,
  isBlockedAddress,
  guardedLookup,
  extractTitle,
  BlockedUrlError,
  MAX_BYTES,
} = require('../lib/safe-fetch.js');

let server;
let base;
let hits = 0;

before(async () => {
  server = http.createServer((req, res) => {
    hits++;
    if (req.url === '/ok') {
      res.setHeader('Content-Type', 'text/html');
      return res.end('<html><head><title> Hello &amp; welcome\n </title></head></html>');
    }
    if (req.url === '/redirect') {
      res.statusCode = 302;
      res.setHeader('Location', '/ok');
      return res.end();
    }
    if (req.url === '/loop') {
      res.statusCode = 302;
      res.setHeader('Location', '/loop');
      return res.end();
    }
    if (req.url === '/to-file') {
      res.statusCode = 302;
      res.setHeader('Location', 'file:///etc/passwd');
      return res.end();
    }
    if (req.url === '/huge') {
      res.setHeader('Content-Type', 'text/html');
      const chunk = 'x'.repeat(64 * 1024);
      let sent = 0;
      const pump = () => {
        while (sent < 64 * 1024 * 1024) {
          sent += chunk.length;
          if (!res.write(chunk)) return res.once('drain', pump);
        }
        res.end('<title>too late</title>');
      };
      res.on('error', () => {});
      return pump();
    }
    if (req.url === '/slow') {
      return; // never answers
    }
    res.statusCode = 404;
    res.end('<title>nope</title>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

test('blocks loopback, private, link-local, CGNAT and reserved IPv4', () => {
  for (const ip of [
    '127.0.0.1', '127.9.9.9', '10.0.0.5', '172.16.0.1', '172.31.255.255',
    '192.168.50.102', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '255.255.255.255',
  ]) {
    assert.strictEqual(isBlockedAddress(ip), true, ip);
  }
});

test('blocks IPv6 loopback, unique-local, link-local and IPv4-mapped private', () => {
  for (const ip of ['::1', '::', 'fc00::1', 'fd12:3456::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:192.168.50.1', '64:ff9b::7f00:1']) {
    assert.strictEqual(isBlockedAddress(ip), true, ip);
  }
});

test('allows public addresses and rejects non-addresses', () => {
  for (const ip of ['1.1.1.1', '8.8.8.8', '172.32.0.1', '100.128.0.1', '2606:4700:4700::1111']) {
    assert.strictEqual(isBlockedAddress(ip), false, ip);
  }
  assert.strictEqual(isBlockedAddress('not-an-ip'), true);
});

test('parseAllowedUrl rejects other schemes, credentials, ports and internal literals', () => {
  for (const bad of [
    'file:///etc/passwd', 'ftp://example.com/', 'gopher://example.com/', 'javascript:alert(1)',
    'http://user:pw@example.com/', 'http://example.com:8080/', 'https://example.com:22/',
    'http://127.0.0.1/', 'http://[::1]/', 'http://192.168.50.120/', 'http://169.254.169.254/latest/meta-data/',
    'http://2130706433/', 'http://0x7f.1/', 'http://0177.0.0.1/', 'not a url', '', 42, null,
    'http://example.com/' + 'a'.repeat(2100),
  ]) {
    assert.throws(() => parseAllowedUrl(bad), BlockedUrlError, String(bad).slice(0, 60));
  }
});

test('parseAllowedUrl accepts ordinary public URLs', () => {
  assert.strictEqual(parseAllowedUrl('https://example.com/a?b=c').hostname, 'example.com');
  assert.strictEqual(parseAllowedUrl('http://1.1.1.1/').hostname, '1.1.1.1');
});

test('guardedLookup refuses a name that resolves to loopback', async () => {
  await assert.rejects(
    new Promise((resolve, reject) =>
      guardedLookup('localhost', { all: true }, (err, addr) => (err ? reject(err) : resolve(addr)))
    ),
    BlockedUrlError
  );
});

test('fetchTitle refuses the local test server unless explicitly allowed, without connecting', async () => {
  const before = hits;
  await assert.rejects(fetchTitle(`${base}/ok`), BlockedUrlError);
  await assert.rejects(fetchTitle('http://localhost/'), BlockedUrlError);
  assert.strictEqual(hits, before);
});

test('fetchTitle reads and tidies the title, following redirects', async () => {
  assert.strictEqual(await fetchTitle(`${base}/ok`, { allowPrivate: true }), 'Hello & welcome');
  assert.strictEqual(await fetchTitle(`${base}/redirect`, { allowPrivate: true }), 'Hello & welcome');
});

test('fetchTitle stops on redirect loops and non-http redirects', async () => {
  await assert.rejects(fetchTitle(`${base}/loop`, { allowPrivate: true }), /Too many redirects/);
  await assert.rejects(fetchTitle(`${base}/to-file`, { allowPrivate: true }), BlockedUrlError);
});

test('fetchTitle stops reading after the byte cap', async () => {
  const started = Date.now();
  const title = await fetchTitle(`${base}/huge`, { allowPrivate: true });
  assert.strictEqual(title, '');
  assert.ok(Date.now() - started < 4000, 'did not read the whole 64 MB body');
  assert.ok(MAX_BYTES <= 1024 * 1024);
});

test('fetchTitle times out on a server that never answers', async () => {
  const started = Date.now();
  await assert.rejects(fetchTitle(`${base}/slow`, { allowPrivate: true, timeoutMs: 300 }));
  assert.ok(Date.now() - started < 2000);
});

test('extractTitle handles missing titles', () => {
  assert.strictEqual(extractTitle('<html></html>'), '');
  assert.strictEqual(extractTitle('<TITLE lang="en">A  B</TITLE>'), 'A B');
});

test('route answers 400 for internal targets and missing url', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/fetch-title', require('../routes/fetch-title.js'));

  for (const url of ['http://127.0.0.1:5010/api/health', 'http://192.168.50.120:5040/', 'http://localhost/', 'file:///etc/passwd']) {
    const res = await request(app).post('/api/fetch-title').send({ url });
    assert.strictEqual(res.status, 400, url);
    assert.deepStrictEqual(res.body, { error: 'URL not allowed' });
  }
  const missing = await request(app).post('/api/fetch-title').send({});
  assert.strictEqual(missing.status, 400);
  const notString = await request(app).post('/api/fetch-title').send({ url: { a: 1 } });
  assert.strictEqual(notString.status, 400);
});
