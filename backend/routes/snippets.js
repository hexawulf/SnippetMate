'use strict';
const express = require('express');
const db = require('../db.js');
const router = express.Router();


router.get('/', async (req, res) => {
  const q = req.query.q?.trim();
  const tag = req.query.tag?.trim();

  const conditions = ['s.user_id = ?'];
  const params = [req.userId];

  if (q) {
    conditions.push('MATCH(s.title, s.content) AGAINST(? IN NATURAL LANGUAGE MODE)');
    params.push(q);
  }
  if (tag) {
    conditions.push('s.id IN (SELECT st2.snippet_id FROM snippet_tags st2 JOIN tags t2 ON st2.tag_id = t2.id WHERE t2.name = ?)');
    params.push(tag);
  }
  const where = 'WHERE ' + conditions.join(' AND ');

  const [rows] = await db.query(
    `SELECT s.*, t.name AS tag
     FROM snippets s
     LEFT JOIN snippet_tags st ON s.id = st.snippet_id
     LEFT JOIN tags t ON st.tag_id = t.id
     ${where}
     ORDER BY s.created_at DESC`,
    params
  );

  const snippetMap = {};
  for (const row of rows) {
    if (!snippetMap[row.id]) {
      snippetMap[row.id] = {
        id: row.id,
        title: row.title,
        content: row.content,
        source_url: row.source_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
        tags: []
      };
    }
    if (row.tag) snippetMap[row.id].tags.push(row.tag);
  }

  res.json(Object.values(snippetMap));
});


router.post('/', async (req, res) => {
  const { title, content, source_url, tags = [] } = req.body;

  const [result] = await db.query(
    'INSERT INTO snippets (title, content, source_url, user_id) VALUES (?, ?, ?, ?)',
    [title, content, source_url, req.userId]
  );
  const snippetId = result.insertId;

  for (const name of tags) {
    const [tagResult] = await db.query(
      'INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      [name]
    );
    await db.query(
      'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)',
      [snippetId, tagResult.insertId]
    );
  }

  res.status(201).json({ id: snippetId });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, source_url, tags = [] } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Confirm ownership before any writes. affectedRows is unreliable here:
    // mysql2 returns 0 when the UPDATE matches the row but changes no values,
    // which would give a legitimate owner a false 404 on a no-op save.
    const [[owned]] = await conn.query(
      'SELECT id FROM snippets WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (!owned) {
      await conn.rollback();
      return res.status(404).json({ error: 'Not found' });
    }

    await conn.query(
      'UPDATE snippets SET title = ?, content = ?, source_url = ? WHERE id = ? AND user_id = ?',
      [title, content, source_url, owned.id, req.userId]
    );

    // Scope the DELETE through the snippets join so this write self-enforces ownership.
    await conn.query(
      `DELETE st FROM snippet_tags st
       JOIN snippets s ON s.id = st.snippet_id
       WHERE st.snippet_id = ? AND s.user_id = ?`,
      [owned.id, req.userId]
    );

    for (const name of tags) {
      const [tagResult] = await conn.query(
        'INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
        [name]
      );
      await conn.query(
        'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)',
        [owned.id, tagResult.insertId]
      );
    }

    await conn.commit();
    res.json({ id: owned.id });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

router.delete('/:id', async (req, res) => {
  const [del] = await db.query('DELETE FROM snippets WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (del.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
