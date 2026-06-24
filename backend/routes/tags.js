'use strict';
const express = require('express');
const db = require('../db.js');
const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT DISTINCT t.name
     FROM tags t
     JOIN snippet_tags st ON st.tag_id = t.id
     JOIN snippets s ON s.id = st.snippet_id
     WHERE s.user_id = ?
     ORDER BY t.name`,
    [req.userId]
  );
  res.json(rows.map(r => r.name));
});

module.exports = router;
