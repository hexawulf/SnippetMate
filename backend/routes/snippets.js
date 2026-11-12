'use strict';
const express = require('express');
const db = require('../db.js');
const { ValidationError, parseSnippet, parseId, searchTerms } = require('../lib/validate.js');
const router = express.Router();

const MAX_IMPORT = 1000;

/** Collapse the snippet × tag join rows into one object per snippet. */
function groupRows(rows, toSnippet) {
  const byId = new Map();
  for (const row of rows) {
    if (!byId.has(row.id)) byId.set(row.id, { ...toSnippet(row), tags: [] });
    if (row.tag) byId.get(row.id).tags.push(row.tag);
  }
  return [...byId.values()];
}

/**
 * Link a snippet to its tags, creating tags that do not exist yet.
 * `tags` is already de-duplicated by parseSnippet; INSERT IGNORE additionally
 * covers names the database collation treats as equal (accents, width).
 */
async function attachTags(conn, snippetId, tags) {
  for (const name of tags) {
    const [tagResult] = await conn.query(
      'INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      [name]
    );
    await conn.query(
      'INSERT IGNORE INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)',
      [snippetId, tagResult.insertId]
    );
  }
}

/** Run `work(conn)` in a transaction; roll back on any error. */
async function inTransaction(work) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

router.get('/', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : '';

  const conditions = ['s.user_id = ?'];
  const params = [req.userId];
  const orderParams = [];
  let order = 's.created_at DESC, s.id DESC';

  // Substring match on every word, so "snip" finds "snippet" and two-letter
  // words such as "js" or "go" work. (The FULLTEXT index ignores words under
  // three characters and has no prefix match in natural-language mode.)
  const terms = searchTerms(q);
  for (const term of terms) {
    conditions.push("(COALESCE(s.title, '') LIKE ? OR s.content LIKE ?)");
    params.push(`%${term}%`, `%${term}%`);
  }
  if (terms.length > 0) {
    // Title matches first, then newest.
    order = "(COALESCE(s.title, '') LIKE ?) DESC, " + order;
    orderParams.push(`%${terms[0]}%`);
  }

  if (tag) {
    conditions.push('s.id IN (SELECT st2.snippet_id FROM snippet_tags st2 JOIN tags t2 ON st2.tag_id = t2.id WHERE t2.name = ?)');
    params.push(tag);
  }

  const [rows] = await db.query(
    `SELECT s.*, t.name AS tag
     FROM snippets s
     LEFT JOIN snippet_tags st ON s.id = st.snippet_id
     LEFT JOIN tags t ON st.tag_id = t.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${order}`,
    [...params, ...orderParams]
  );

  res.json(groupRows(rows, (row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    source_url: row.source_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })));
});

router.post('/', async (req, res) => {
  const snippet = parseSnippet(req.body);

  // One transaction: a failure while tagging must not leave a snippet behind.
  const id = await inTransaction(async (conn) => {
    const [result] = await conn.query(
      'INSERT INTO snippets (title, content, source_url, user_id) VALUES (?, ?, ?, ?)',
      [snippet.title, snippet.content, snippet.source_url, req.userId]
    );
    await attachTags(conn, result.insertId, snippet.tags);
    return result.insertId;
  });

  res.status(201).json({ id });
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ error: 'Not found' });
  const snippet = parseSnippet(req.body);

  const found = await inTransaction(async (conn) => {
    // Confirm ownership before any writes. affectedRows is unreliable here:
    // mysql2 returns 0 when the UPDATE matches the row but changes no values,
    // which would give a legitimate owner a false 404 on a no-op save.
    const [[owned]] = await conn.query(
      'SELECT id FROM snippets WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (!owned) return false;

    await conn.query(
      'UPDATE snippets SET title = ?, content = ?, source_url = ? WHERE id = ? AND user_id = ?',
      [snippet.title, snippet.content, snippet.source_url, owned.id, req.userId]
    );

    // Scope the DELETE through the snippets join so this write self-enforces ownership.
    await conn.query(
      `DELETE st FROM snippet_tags st
       JOIN snippets s ON s.id = st.snippet_id
       WHERE st.snippet_id = ? AND s.user_id = ?`,
      [owned.id, req.userId]
    );
    await attachTags(conn, owned.id, snippet.tags);
    return true;
  });

  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json({ id });
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ error: 'Not found' });
  const [del] = await db.query('DELETE FROM snippets WHERE id = ? AND user_id = ?', [id, req.userId]);
  if (del.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

router.get('/export', async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.*, t.name AS tag
     FROM snippets s
     LEFT JOIN snippet_tags st ON s.id = st.snippet_id
     LEFT JOIN tags t ON st.tag_id = t.id
     WHERE s.user_id = ?
     ORDER BY s.created_at DESC, s.id DESC`,
    [req.userId]
  );

  const exportData = {
    format: 'snippetmate-export',
    version: 1,
    exported_at: new Date().toISOString(),
    snippets: groupRows(rows, (row) => ({
      title: row.title,
      content: row.content,
      source_url: row.source_url,
      created_at: row.created_at,
    })),
  };

  res.setHeader('Content-Disposition', 'attachment; filename="snippetmate-export.json"');
  res.json(exportData);
});

router.post('/import', async (req, res) => {
  const { format, version, snippets } = req.body || {};

  if (format !== 'snippetmate-export' || version !== 1) {
    return res.status(400).json({ error: 'Invalid format or version' });
  }

  if (!Array.isArray(snippets)) {
    return res.status(400).json({ error: 'Snippets must be an array' });
  }

  if (snippets.length > MAX_IMPORT) {
    return res.status(400).json({ error: `Import capped at ${MAX_IMPORT} snippets` });
  }

  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (let i = 0; i < snippets.length; i++) {
    const row = snippets[i];
    const rowTitle = row && typeof row === 'object' && typeof row.title === 'string' ? row.title : undefined;

    let snippet;
    try {
      snippet = parseSnippet(row, { requireTitle: true });
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      errors.push({ index: i, title: rowTitle, error: err.message });
      continue;
    }

    try {
      const created = await inTransaction(async (conn) => {
        const [[existing]] = await conn.query(
          'SELECT id FROM snippets WHERE user_id = ? AND content = ? AND source_url <=> ? LIMIT 1',
          [req.userId, snippet.content, snippet.source_url]
        );
        if (existing) return false;

        const [result] = await conn.query(
          'INSERT INTO snippets (title, content, source_url, user_id) VALUES (?, ?, ?, ?)',
          [snippet.title, snippet.content, snippet.source_url, req.userId]
        );
        await attachTags(conn, result.insertId, snippet.tags);
        return true;
      });
      if (created) imported++;
      else skipped++;
    } catch (err) {
      console.error('[import] row failed:', err?.code, err?.message);
      errors.push({ index: i, title: rowTitle, error: 'Could not save this snippet' });
    }
  }

  res.json({ imported, skipped, errors });
});

module.exports = router;
