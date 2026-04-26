const express = require('express');
const db = require('../db.js');
const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.*, t.name AS tag
     FROM snippets s
     LEFT JOIN snippet_tags st ON s.id = st.snippet_id
     LEFT JOIN tags t ON st.tag_id = t.id
     ORDER BY s.created_at DESC`
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
    'INSERT INTO snippets (title, content, source_url) VALUES (?, ?, ?)',
    [title, content, source_url]
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

  await db.query(
    'UPDATE snippets SET title = ?, content = ?, source_url = ? WHERE id = ?',
    [title, content, source_url, id]
  );

  await db.query('DELETE FROM snippet_tags WHERE snippet_id = ?', [id]);

  for (const name of tags) {
    const [tagResult] = await db.query(
      'INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      [name]
    );
    await db.query(
      'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)',
      [id, tagResult.insertId]
    );
  }

  res.json({ id: Number(id) });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM snippets WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

module.exports = router;